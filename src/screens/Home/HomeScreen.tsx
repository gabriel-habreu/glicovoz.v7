import React, { useState, useCallback } from 'react';
import {
  Platform,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import {
  useAudioRecorder,
  RecordingPresets,
  AudioModule,
} from 'expo-audio';
import { Mic } from 'lucide-react-native';
import { Cores } from '../../colors';
import { GlicemiaDados } from '../../types';

type AppStatus = 'ocioso' | 'gravando' | 'processando';

interface Props {
  onNewResult: (result: GlicemiaDados) => void;
}

const GEMINI_PROMPT = `Você é um assistente que analisa áudios sobre glicemia. Retorne SOMENTE um JSON puríssimo, sem markdown, no formato:
{"glicemia": number, "frase": "transcrição exata da fala", "status": "normal" | "alto" | "baixo"}
Regra: baixo se glicemia < 70, normal se 70-140, alto se > 140.`;

async function converterParaBase64(uri: string): Promise<string> {
  if (Platform.OS === 'web') {
    // No navegador, o áudio vem como Blob — convertemos usando APIs do próprio navegador.
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Completo = reader.result as string;
        // O FileReader devolve algo como "data:audio/webm;base64,AAAA..."
        // — precisamos remover esse prefixo, sobrando só o base64 puro.
        const base64Puro = base64Completo.split(',')[1];
        resolve(base64Puro);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } else {
    // No celular, continua usando o FileSystem normalmente.
    return FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  }
}

async function enviarParaGemini(uri: string): Promise<GlicemiaDados> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) throw new Error('Chave EXPO_PUBLIC_GEMINI_API_KEY não configurada no .env');

  const base64Audio = await converterParaBase64(uri);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: GEMINI_PROMPT },
          { inline_data: { mime_type: Platform.OS === 'web' ? 'audio/webm' : 'audio/mp4', data: base64Audio } },
        ],
      }],
      generationConfig: { response_mime_type: 'application/json' },
    }),
  });

  if (!response.ok) {
    throw new Error(`Erro Gemini: ${response.status} - ${await response.text()}`);
  }

  const data = await response.json();
  const rawText: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error('Resposta do Gemini vazia.');

  const parsed = JSON.parse(rawText.replace(/```json|```/g, '').trim());

  const horario = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return { ...parsed, horario, timestamp: Date.now() };
}

export default function HomeScreen({ onNewResult }: Props) {
  const [status, setStatus] = useState<AppStatus>('ocioso');
  const [result, setResult] = useState<GlicemiaDados | null>(null);

  const audioRecorder = useAudioRecorder(RecordingPresets.LOW_QUALITY);

  const iniciarGravacao = useCallback(async () => {
    try {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permissão necessária', 'Autorize o microfone para continuar.');
        return;
      }
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setStatus('gravando');
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível iniciar a gravação.');
    }
  }, [audioRecorder]);

  const finalizarGravacao = useCallback(async () => {
    try {
      setStatus('processando');
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      if (!uri) throw new Error('Áudio não encontrado.');

      const glicemiaResult = await enviarParaGemini(uri);
      setResult(glicemiaResult);
      onNewResult(glicemiaResult);
      setStatus('ocioso');
    } catch (error) {
      console.error(error);
      Alert.alert('Erro ao processar', error instanceof Error ? error.message : 'Tente novamente.');
      setStatus('ocioso');
    }
  }, [audioRecorder, onNewResult]);

  const handlePress = () => {
    if (status === 'ocioso') iniciarGravacao();
    else if (status === 'gravando') finalizarGravacao();
  };

  const feedbackText =
    status === 'gravando' ? 'ESTOU OUVINDO...'
    : status === 'processando' ? 'ESTOU PROCESSANDO...'
    : 'TOQUE NO BOTÃO E FALE SUA GLICEMIA';

  const statusColor = result?.status === 'baixo' ? '#F59E0B'
    : result?.status === 'alto' ? '#E53935'
    : '#10B981';

  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.welcome}>
        SEJA BEM-VINDO,{'\n'}
        <Text style={styles.welcomeHighlight}>USUÁRIO!</Text>
      </Text>

      <TouchableOpacity
        onPress={handlePress}
        disabled={status === 'processando'}
        style={[styles.button, status === 'gravando' && styles.buttonRecording]}
      >
        {status === 'processando'
          ? <ActivityIndicator size="large" color="#F4F8FB" />
          : <Mic color="#F4F8FB" size={67} />}
      </TouchableOpacity>
      <Text style={styles.feedback}>{feedbackText}</Text>

      {result && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Você disse:</Text>
          <Text style={styles.cardText}>"{result.frase}"</Text>
          <View style={styles.cardRow}>
            <Text style={styles.cardValue}>{result.glicemia} mg/dL</Text>
            <Text style={[styles.cardStatus, { color: statusColor }]}>
              STATUS: {result.status.toUpperCase()}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Cores.backgroundColor, alignItems: 'center', paddingTop: 24 },
  logo: { width: 320, height: 180, marginBottom: 8 },
  welcome: { fontSize: 20, fontFamily: 'AtkinsonHyperlegible_700Bold', color: Cores.fontColor, textAlign: 'center', marginBottom: 24 },
  welcomeHighlight: { color: Cores.primaryColor },
  button: { width: 180, height: 180, borderRadius: 100, backgroundColor: Cores.primaryColor, alignItems: 'center', justifyContent: 'center', elevation: 8, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 10 },
  buttonRecording: { opacity: 0.6, transform: [{ scale: 1.05 }] },
  feedback: { fontSize: 18, fontStyle: 'italic', fontFamily: 'AtkinsonHyperlegible_700Bold', color: Cores.fontColor, marginTop: 20, textAlign: 'center', paddingHorizontal: 24 },
  card: { width: '100%', paddingHorizontal: 24, paddingVertical: 20, marginTop: 32, backgroundColor: Cores.whiteStrong, borderWidth: 1, borderColor: Cores.whiteGrey, borderRadius: 16 },
  cardLabel: { fontSize: 13, color: '#64748B', fontFamily: 'AtkinsonHyperlegible_400Regular' },
  cardText: { fontSize: 15, fontFamily: 'AtkinsonHyperlegible_400Regular', fontStyle: 'italic', marginBottom: 16, color: '#1e293b' },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 14 },
  cardValue: { fontSize: 22, fontFamily: 'AtkinsonHyperlegible_700Bold', color: Cores.fontColor },
  cardStatus: { fontSize: 13, fontFamily: 'AtkinsonHyperlegible_700Bold' },
});