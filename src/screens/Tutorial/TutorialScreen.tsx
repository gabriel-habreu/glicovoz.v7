import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Mic, Bell, History as HistoryIcon, X } from 'lucide-react-native';
import { Cores } from '../../colors';

interface Props {
  onFechar: () => void;
}

const PASSOS = [
  {
    icon: Mic,
    titulo: 'Registrar sua glicemia',
    texto: 'Na tela inicial, toque no botão vermelho grande e fale o valor da sua glicemia. Toque de novo para parar de gravar.',
  },
  {
    icon: HistoryIcon,
    titulo: 'Ver seu histórico',
    texto: 'Toque no ícone de relógio, na parte de baixo da tela, para ver todos os registros que você já fez.',
  },
  {
    icon: Bell,
    titulo: 'Configurar lembretes',
    texto: 'Toque no ícone de engrenagem para gravar uma mensagem de voz e escolher o horário do lembrete diário.',
  },
];

export default function TutorialScreen({ onFechar }: Props) {
  const [passoAtual, setPassoAtual] = useState(0);
  const passo = PASSOS[passoAtual];
  const Icone = passo.icon;

  const proximo = () => {
    if (passoAtual < PASSOS.length - 1) {
      setPassoAtual(passoAtual + 1);
    } else {
      onFechar();
    }
  };

  const voltar = () => {
    if (passoAtual > 0) setPassoAtual(passoAtual - 1);
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <TouchableOpacity style={styles.fechar} onPress={onFechar}>
          <X color={Cores.fontColor} size={28} />
        </TouchableOpacity>

        <View style={styles.iconWrapper}>
          <Icone color={Cores.primaryColor} size={64} />
        </View>

        <Text style={styles.titulo}>{passo.titulo}</Text>
        <Text style={styles.texto}>{passo.texto}</Text>

        <Text style={styles.contador}>
          Passo {passoAtual + 1} de {PASSOS.length}
        </Text>

        <View style={styles.botoes}>
          {passoAtual > 0 && (
            <TouchableOpacity style={styles.botaoSecundario} onPress={voltar}>
              <Text style={styles.botaoSecundarioTexto}>VOLTAR</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.botaoPrimario} onPress={proximo}>
            <Text style={styles.botaoPrimarioTexto}>
              {passoAtual < PASSOS.length - 1 ? 'PRÓXIMO' : 'ENTENDI'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', backgroundColor: Cores.backgroundColor, borderRadius: 20, padding: 28, alignItems: 'center' },
  fechar: { position: 'absolute', top: 16, right: 16 },
  iconWrapper: { backgroundColor: Cores.whiteStrong, borderRadius: 100, padding: 20, marginBottom: 20, marginTop: 12 },
  titulo: { fontSize: 22, fontFamily: 'AtkinsonHyperlegible_700Bold', color: Cores.fontColor, textAlign: 'center', marginBottom: 12 },
  texto: { fontSize: 17, fontFamily: 'AtkinsonHyperlegible_400Regular', color: Cores.fontColor, textAlign: 'center', lineHeight: 26 },
  contador: { fontSize: 14, fontFamily: 'AtkinsonHyperlegible_400Regular', color: '#64748B', marginTop: 20 },
  botoes: { flexDirection: 'row', gap: 12, marginTop: 24, width: '100%' },
  botaoPrimario: { flex: 1, backgroundColor: Cores.primaryColor, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  botaoPrimarioTexto: { color: '#F4F8FB', fontFamily: 'AtkinsonHyperlegible_700Bold', fontSize: 16 },
  botaoSecundario: { flex: 1, backgroundColor: Cores.whiteGrey, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  botaoSecundarioTexto: { color: Cores.fontColor, fontFamily: 'AtkinsonHyperlegible_700Bold', fontSize: 16 },
});