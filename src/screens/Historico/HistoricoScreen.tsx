import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Filter, FileDown } from 'lucide-react-native';
import { Cores } from '../../colors';
import { GlicemiaDados } from '../../types';

interface Props {
  history: GlicemiaDados[];
}

type FiltroTipo = 'dia' | 'semana' | 'mes' | 'todos';
const UM_DIA_MS = 24 * 60 * 60 * 1000;

export default function HistoricoScreen({ history }: Props) {
  const [filtroAberto, setFiltroAberto] = useState(false);
  const [filtro, setFiltro] = useState<FiltroTipo>('todos');

  const historyFiltrado = useMemo(() => {
    if (filtro === 'todos') return history;
    const agora = Date.now();
    const limites: Record<Exclude<FiltroTipo, 'todos'>, number> = {
      dia: UM_DIA_MS,
      semana: 7 * UM_DIA_MS,
      mes: 30 * UM_DIA_MS,
    };
    return history.filter((item) => agora - item.timestamp <= limites[filtro]);
  }, [history, filtro]);

  const opcoes: { tipo: FiltroTipo; label: string }[] = [
    { tipo: 'dia', label: 'Hoje' },
    { tipo: 'semana', label: '7 dias' },
    { tipo: 'mes', label: '30 dias' },
    { tipo: 'todos', label: 'Tudo' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Histórico</Text>
        <TouchableOpacity onPress={() => setFiltroAberto(!filtroAberto)}>
          <Filter color={Cores.primaryColor} size={28} />
        </TouchableOpacity>
      </View>

      {filtroAberto && (
        <View style={styles.chipsRow}>
          {opcoes.map((op) => (
            <TouchableOpacity
              key={op.tipo}
              style={[styles.chip, filtro === op.tipo && styles.chipAtivo]}
              onPress={() => setFiltro(op.tipo)}
            >
              <Text style={[styles.chipTexto, filtro === op.tipo && styles.chipTextoAtivo]}>
                {op.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {historyFiltrado.length === 0 ? (
          <Text style={styles.empty}>Nenhum registro neste período.</Text>
        ) : (
          historyFiltrado.slice().reverse().map((item, index) => (
            <View key={index} style={styles.item}>
              <Text style={styles.itemTime}>{item.horario}</Text>
              <Text style={styles.itemValue}>{item.glicemia} mg/dL</Text>
              <Text style={styles.itemPhrase}>"{item.frase}"</Text>
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.botaoPdf}
        onPress={() => Alert.alert('Em breve', 'A geração de relatório em PDF será disponibilizada em uma próxima atualização.')}
      >
        <FileDown color="#fff" size={20} />
        <Text style={styles.botaoPdfTexto}>Gerar Relatório em PDF</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Cores.backgroundColor, paddingHorizontal: 24, paddingTop: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 22, fontFamily: 'AtkinsonHyperlegible_700Bold', color: Cores.fontColor },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: Cores.whiteStrong, borderWidth: 1, borderColor: Cores.whiteGrey },
  chipAtivo: { backgroundColor: Cores.primaryColor, borderColor: Cores.primaryColor },
  chipTexto: { fontFamily: 'AtkinsonHyperlegible_700Bold', color: Cores.fontColor, fontSize: 14 },
  chipTextoAtivo: { color: '#fff' },
  empty: { fontFamily: 'AtkinsonHyperlegible_400Regular', color: '#64748B', textAlign: 'center', marginTop: 40 },
  item: { backgroundColor: Cores.whiteStrong, borderWidth: 1, borderColor: Cores.whiteGrey, borderRadius: 12, padding: 16, marginBottom: 12 },
  itemTime: { fontSize: 12, color: '#64748B', fontFamily: 'AtkinsonHyperlegible_400Regular' },
  itemValue: { fontSize: 20, fontFamily: 'AtkinsonHyperlegible_700Bold', color: Cores.fontColor, marginVertical: 4 },
  itemPhrase: { fontSize: 14, fontFamily: 'AtkinsonHyperlegible_400Regular', fontStyle: 'italic', color: '#1e293b' },
  botaoPdf: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Cores.primaryColor, borderRadius: 12, paddingVertical: 14, marginVertical: 16, gap: 8 },
  botaoPdfTexto: { color: '#fff', fontFamily: 'AtkinsonHyperlegible_700Bold', fontSize: 15 },
});