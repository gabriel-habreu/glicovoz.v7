import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { UserCircle } from 'lucide-react-native';
import { Cores } from '../../colors';

const OPCOES_DIABETES = ['Tipo 1', 'Tipo 2', 'Gestacional', 'Pré-diabetes', 'Outro'];

export default function PerfilScreen() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [tipoDiabetes, setTipoDiabetes] = useState('Tipo 2');
  const [medicamentos, setMedicamentos] = useState('');

  // Remove qualquer caractere que não seja dígito, e limita a 11 números
  // (padrão de celular brasileiro com DDD) — impede letras e excesso de dígitos.
  const handleTelefoneChange = (texto: string) => {
    const apenasNumeros = texto.replace(/\D/g, '').slice(0, 11);
    setTelefone(apenasNumeros);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <UserCircle color={Cores.primaryColor} size={90} />
      <Text style={styles.titulo}>Meu Perfil</Text>

      <Text style={styles.label}>Nome completo</Text>
      <TextInput
        style={styles.input}
        value={nome}
        onChangeText={setNome}
        placeholder="Digite seu nome"
        placeholderTextColor="#94A3B8"
      />

      <Text style={styles.label}>E-mail</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="seu@email.com"
        placeholderTextColor="#94A3B8"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Telefone</Text>
      <TextInput
        style={styles.input}
        value={telefone}
        onChangeText={handleTelefoneChange}
        placeholder="Somente números, com DDD"
        placeholderTextColor="#94A3B8"
        keyboardType="number-pad"
        maxLength={11}
      />

      <Text style={styles.label}>Tipo de diabetes</Text>
      <View style={styles.chipsRow}>
        {OPCOES_DIABETES.map((opcao) => (
          <TouchableOpacity
            key={opcao}
            style={[styles.chip, tipoDiabetes === opcao && styles.chipAtivo]}
            onPress={() => setTipoDiabetes(opcao)}
          >
            <Text style={[styles.chipTexto, tipoDiabetes === opcao && styles.chipTextoAtivo]}>
              {opcao}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Medicamentos em uso</Text>
      <TextInput
        style={[styles.input, styles.inputMultilinha]}
        value={medicamentos}
        onChangeText={setMedicamentos}
        placeholder="Ex: Metformina 500mg, Insulina NPH"
        placeholderTextColor="#94A3B8"
        multiline
        numberOfLines={3}
      />

      <Text style={styles.aviso}>
        Versão de demonstração — dados ainda não são salvos entre sessões.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: Cores.backgroundColor, alignItems: 'center', padding: 24, paddingTop: 40 },
  titulo: { fontSize: 22, fontFamily: 'AtkinsonHyperlegible_700Bold', color: Cores.fontColor, marginTop: 12, marginBottom: 24 },
  label: { alignSelf: 'flex-start', fontSize: 15, fontFamily: 'AtkinsonHyperlegible_700Bold', color: Cores.fontColor, marginTop: 12, marginBottom: 6 },
  input: {
    width: '100%',
    backgroundColor: Cores.whiteStrong,
    borderWidth: 1,
    borderColor: Cores.whiteGrey,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'AtkinsonHyperlegible_400Regular',
    color: Cores.fontColor,
  },
  inputMultilinha: { minHeight: 80, textAlignVertical: 'top' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, width: '100%' },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: Cores.whiteStrong, borderWidth: 1, borderColor: Cores.whiteGrey },
  chipAtivo: { backgroundColor: Cores.primaryColor, borderColor: Cores.primaryColor },
  chipTexto: { fontFamily: 'AtkinsonHyperlegible_700Bold', color: Cores.fontColor, fontSize: 14 },
  chipTextoAtivo: { color: '#fff' },
  aviso: { fontSize: 12, color: '#64748B', fontFamily: 'AtkinsonHyperlegible_400Regular', textAlign: 'center', marginTop: 24 },
});