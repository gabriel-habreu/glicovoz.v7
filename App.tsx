import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Text, Animated, PanResponder, Dimensions } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import * as FileSystem from 'expo-file-system/legacy';
import { useAudioPlayer } from 'expo-audio';
import { Home as HomeIcon, User, History, Settings, HelpCircle } from 'lucide-react-native';
import { useFonts } from '@expo-google-fonts/atkinson-hyperlegible/useFonts';
import { AtkinsonHyperlegible_400Regular } from '@expo-google-fonts/atkinson-hyperlegible/400Regular';
import { AtkinsonHyperlegible_700Bold } from '@expo-google-fonts/atkinson-hyperlegible/700Bold';

import LoginScreen from './src/screens/Login/LoginScreen';
import TutorialScreen from './src/screens/Tutorial/TutorialScreen';
import HomeScreen from './src/screens/Home/HomeScreen';
import HistoricoScreen from './src/screens/Historico/HistoricoScreen';
import PerfilScreen from './src/screens/Perfil/PerfilScreen';
import ConfiguracoesScreen from './src/screens/Configuracoes/ConfiguracoesScreen';
import { Cores } from './src/colors';
import { GlicemiaDados } from './src/types';

type Tela = 'home' | 'historico' | 'perfil' | 'configuracoes';

const AUDIO_ALERTA_PATH = `${FileSystem.documentDirectory}alerta_glicemia.m4a`;
const BOTAO_TAMANHO = 48;
const MARGEM = 16;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  // TODOS os hooks ficam aqui em cima, antes de qualquer "if" com return.
  let [fontsLoaded] = useFonts({
    AtkinsonHyperlegible_400Regular,
    AtkinsonHyperlegible_700Bold,
  });

  const [logado, setLogado] = useState(false);
  const [mostrarTutorial, setMostrarTutorial] = useState(false);
  const [tela, setTela] = useState<Tela>('home');
  const [history, setHistory] = useState<GlicemiaDados[]>([]);
  const player = useAudioPlayer(null);

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  const posicaoBotao = useRef(
    new Animated.ValueXY({ x: screenWidth - BOTAO_TAMANHO - MARGEM, y: 80 })
  ).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 5 || Math.abs(gesture.dy) > 5,

      onPanResponderGrant: () => {
        posicaoBotao.setOffset({
          x: (posicaoBotao.x as any)._value,
          y: (posicaoBotao.y as any)._value,
        });
        posicaoBotao.setValue({ x: 0, y: 0 });
      },

      onPanResponderMove: Animated.event(
        [null, { dx: posicaoBotao.x, dy: posicaoBotao.y }],
        { useNativeDriver: false }
      ),

      onPanResponderRelease: (_, gesture) => {
        posicaoBotao.flattenOffset();
        const paraDireita = gesture.moveX > screenWidth / 2;
        const paraCima = gesture.moveY < screenHeight / 2;

        Animated.spring(posicaoBotao, {
          toValue: {
            x: paraDireita ? screenWidth - BOTAO_TAMANHO - MARGEM : MARGEM,
            y: paraCima ? MARGEM + 40 : screenHeight - BOTAO_TAMANHO - MARGEM - 100,
          },
          useNativeDriver: false,
          friction: 6,
        }).start();
      },
    })
  ).current;

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(async () => {
      const info = await FileSystem.getInfoAsync(AUDIO_ALERTA_PATH);
      if (info.exists) {
        player.replace(AUDIO_ALERTA_PATH);
        player.play();
      }
    });
    return () => subscription.remove();
  }, [player]);

  // A partir daqui, pode ter quantos "if" com return quiser —
  // todos os hooks já foram chamados acima, sempre na mesma ordem.
  if (!fontsLoaded) {
    return null;
  }

  if (!logado) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: Cores.backgroundColor }}>
          <LoginScreen onLoginSuccess={() => setLogado(true)} />
          <StatusBar style="auto" />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  const adicionarAoHistorico = (result: GlicemiaDados) => {
    setHistory((prev) => [...prev, result]);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: Cores.backgroundColor }} edges={['top', 'bottom']}>
        {tela === 'home' && <HomeScreen onNewResult={adicionarAoHistorico} />}
        {tela === 'historico' && <HistoricoScreen history={history} />}
        {tela === 'perfil' && <PerfilScreen />}
        {tela === 'configuracoes' && (
          Platform.OS === 'web'
            ? (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                <Text style={{ fontFamily: 'AtkinsonHyperlegible_400Regular', textAlign: 'center', color: Cores.fontColor }}>
                  Os lembretes de voz estão disponíveis apenas no aplicativo mobile.
                </Text>
              </View>
            )
            : <ConfiguracoesScreen />
        )}

        <Animated.View
          style={[styles.ajudaButton, { transform: posicaoBotao.getTranslateTransform() }]}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity onPress={() => setMostrarTutorial(true)} style={styles.ajudaButtonInner}>
            <HelpCircle color="#F4F8FB" size={28} />
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.footer}>
          <TouchableOpacity onPress={() => setTela('home')}>
            <HomeIcon color={tela === 'home' ? Cores.primaryColor : Cores.fontColor} size={32} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setTela('historico')}>
            <History color={tela === 'historico' ? Cores.primaryColor : Cores.fontColor} size={32} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setTela('perfil')}>
            <User color={tela === 'perfil' ? Cores.primaryColor : Cores.fontColor} size={32} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setTela('configuracoes')}>
            <Settings color={tela === 'configuracoes' ? Cores.primaryColor : Cores.fontColor} size={32} />
          </TouchableOpacity>
        </View>

        {mostrarTutorial && <TutorialScreen onFechar={() => setMostrarTutorial(false)} />}

        <StatusBar style="auto" />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Cores.whiteGrey,
    backgroundColor: Cores.backgroundColor,
  },
  ajudaButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 48,
    height: 48,
    zIndex: 10,
  },
  ajudaButtonInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Cores.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
});