import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Cores } from '../../colors';

interface Props {
  onLoginSuccess: () => void;
}

export default function LoginScreen({ onLoginSuccess }: Props) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleEntrar = () => {
    if (email.trim() === '' || senha.trim() === '') {
      setErro('Preencha e-mail e senha para continuar.');
      return;
    }
    setErro('');
    onLoginSuccess();
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Entrar</Text>

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

      <Text style={styles.label}>Senha</Text>
      <TextInput
        style={styles.input}
        value={senha}
        onChangeText={setSenha}
        placeholder="Digite sua senha"
        placeholderTextColor="#94A3B8"
        secureTextEntry
      />

      {erro !== '' && <Text style={styles.erro}>{erro}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleEntrar}>
        <Text style={styles.buttonText}>ENTRAR</Text>
      </TouchableOpacity>

      <Text style={styles.aviso}>
        Versão inicial — login ainda não conectado a um banco de dados real.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Cores.backgroundColor, alignItems: 'center', justifyContent: 'center', padding: 24 },
  logo: { width: 220, height: 130, marginBottom: 16 },
  title: { fontSize: 24, fontFamily: 'AtkinsonHyperlegible_700Bold', color: Cores.fontColor, marginBottom: 24 },
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
  erro: { color: Cores.primaryColor, fontFamily: 'AtkinsonHyperlegible_700Bold', marginTop: 16, textAlign: 'center' },
  button: { width: '100%', backgroundColor: Cores.primaryColor, borderRadius: 12, paddingVertical: 16, marginTop: 24, alignItems: 'center' },
  buttonText: { color: '#F4F8FB', fontFamily: 'AtkinsonHyperlegible_700Bold', fontSize: 17 },
  aviso: { fontSize: 12, color: '#64748B', fontFamily: 'AtkinsonHyperlegible_400Regular', textAlign: 'center', marginTop: 20 },
});