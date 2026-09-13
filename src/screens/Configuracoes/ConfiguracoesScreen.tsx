import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAudioRecorder, RecordingPresets, AudioModule } from 'expo-audio';
import { Mic, Bell } from 'lucide-react-native';
import { Cores } from '../../colors';

// Caminho fixo — assim, o app sempre sabe onde procurar o áudio salvo,
// mesmo depois de fechar e abrir de novo.
const AUDIO_ALERTA_PATH = `${FileSystem.documentDirectory}alerta_glicemia.m4a`;
const DURACAO_MAXIMA_MS = 3000; // 3 segundos, conforme pedido

export default function ConfiguracoesScreen() {
  const [gravando, setGravando] = useState(false);
  const [audioSalvo, setAudioSalvo] = useState(false);
  const [horario, setHorario] = useState(new Date());
  const [mostrarPicker, setMostrarPicker] = useState(false);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  // Verifica, ao abrir a tela, se já existe um áudio salvo de antes
  useEffect(() => {
    FileSystem.getInfoAsync(AUDIO_ALERTA_PATH).then((info) => {
      setAudioSalvo(info.exists);
    });
  }, []);

  const gravarMensagem = useCallback(async () => {
    const permission = await AudioModule.requestRecordingPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Autorize o microfone para gravar a mensagem.');
      return;
    }

    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
    setGravando(true);

    // Corta a gravação automaticamente em 3 segundos — o pedido era
    // "no máximo 3 segundos", então paramos por conta própria, sem
    // depender do usuário lembrar de soltar o botão no tempo certo.
    setTimeout(async () => {
      await audioRecorder.stop();
      const uriTemporaria = audioRecorder.uri;
      setGravando(false);

      if (!uriTemporaria) {
        Alert.alert('Erro', 'Não foi possível gravar o áudio.');
        return;
      }

      // Move da pasta temporária pra pasta permanente do app,
      // sempre com o mesmo nome — sobrescrevendo a gravação anterior.
      const infoExistente = await FileSystem.getInfoAsync(AUDIO_ALERTA_PATH);
      if (infoExistente.exists) {
        await FileSystem.deleteAsync(AUDIO_ALERTA_PATH);
      }
      await FileSystem.copyAsync({ from: uriTemporaria, to: AUDIO_ALERTA_PATH });

      setAudioSalvo(true);
      Alert.alert('Mensagem salva!', 'Seu alerta de voz foi gravado com sucesso.');
    }, DURACAO_MAXIMA_MS);
  }, [audioRecorder]);

  const agendarNotificacao = useCallback(async () => {
    if (!audioSalvo) {
      Alert.alert('Grave a mensagem primeiro', 'É preciso ter um áudio salvo antes de agendar o alerta.');
      return;
    }

    const permission = await Notifications.requestPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Autorize notificações para receber os alertas.');
      return;
    }

    // Cancela agendamentos antigos antes de criar um novo,
    // pra não acumular vários alertas duplicados a cada configuração.
    await Notifications.cancelAllScheduledNotificationsAsync();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'GlicoVoz',
        body: 'Hora de medir sua glicemia!',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: horario.getHours(),
        minute: horario.getMinutes(),
      },
    });

    Alert.alert(
      'Alerta agendado!',
      `Você será lembrado todo dia às ${horario.getHours().toString().padStart(2, '0')}:${horario
        .getMinutes()
        .toString()
        .padStart(2, '0')}.`
    );
  }, [audioSalvo, horario]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configurações de Alerta</Text>

      <View style={styles.card}>
        <Text style={styles.label}>1. Grave sua mensagem de alerta (até 3s)</Text>
        <TouchableOpacity
          style={[styles.button, gravando && styles.buttonRecording]}
          onPress={gravarMensagem}
          disabled={gravando}
        >
          <Mic color="#F4F8FB" size={32} />
          <Text style={styles.buttonText}>{gravando ? 'Gravando...' : 'Gravar mensagem'}</Text>
        </TouchableOpacity>
        {audioSalvo && <Text style={styles.status}>✓ Mensagem salva</Text>}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>2. Escolha o horário do lembrete</Text>
        <TouchableOpacity style={styles.timeButton} onPress={() => setMostrarPicker(true)}>
          <Text style={styles.timeText}>
            {horario.getHours().toString().padStart(2, '0')}:
            {horario.getMinutes().toString().padStart(2, '0')}
          </Text>
        </TouchableOpacity>
        {mostrarPicker && (
          <DateTimePicker
            value={horario}
            mode="time"
            is24Hour
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_, selectedDate) => {
              setMostrarPicker(false);
              if (selectedDate) setHorario(selectedDate);
            }}
          />
        )}
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={agendarNotificacao}>
        <Bell color="#F4F8FB" size={24} />
        <Text style={styles.saveButtonText}>Salvar e ativar alerta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Cores.backgroundColor, padding: 24 },
  title: { fontSize: 22, fontFamily: 'AtkinsonHyperlegible_700Bold', color: Cores.fontColor, marginBottom: 24 },
  card: { backgroundColor: Cores.whiteStrong, borderWidth: 1, borderColor: Cores.whiteGrey, borderRadius: 16, padding: 16, marginBottom: 20 },
  label: { fontSize: 15, fontFamily: 'AtkinsonHyperlegible_700Bold', color: Cores.fontColor, marginBottom: 12 },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Cores.primaryColor, borderRadius: 12, paddingVertical: 14, gap: 10 },
  buttonRecording: { opacity: 0.6 },
  buttonText: { color: '#F4F8FB', fontFamily: 'AtkinsonHyperlegible_700Bold', fontSize: 16 },
  status: { color: '#10B981', fontFamily: 'AtkinsonHyperlegible_700Bold', marginTop: 10, textAlign: 'center' },
  timeButton: { backgroundColor: Cores.backgroundColor, borderWidth: 1, borderColor: Cores.whiteGrey, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  timeText: { fontSize: 28, fontFamily: 'AtkinsonHyperlegible_700Bold', color: Cores.primaryColor },
  saveButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Cores.fontColor, borderRadius: 12, paddingVertical: 16, gap: 10, marginTop: 8 },
  saveButtonText: { color: '#F4F8FB', fontFamily: 'AtkinsonHyperlegible_700Bold', fontSize: 16 },
});