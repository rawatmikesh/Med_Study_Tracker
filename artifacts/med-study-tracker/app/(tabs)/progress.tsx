import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import colors from '@/constants/colors';
import { useStudy } from '@/context/StudyContext';

const palette = colors.light;

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const { topics, totalMinutes, totalHours, totalTargetHours, logStudy } = useStudy();
  const remaining = Math.max(0, totalTargetHours - totalHours);

  const handleLog = (topicId: string) => {
    logStudy(topicId, 0.5);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>STEP 2 CK</Text>
          <Text style={styles.title}>Topic pulse</Text>
          <Text style={styles.subtitle}>Keep the next session obvious. You do not need to finish everything today.</Text>
        </View>

        <View style={styles.overviewCard}>
          <View style={styles.overviewTop}>
            <View>
              <Text style={styles.overviewLabel}>CURRENT COVERAGE</Text>
              <Text style={styles.overviewNumber}>{totalHours.toFixed(1)}<Text style={styles.overviewDenom}> / {totalTargetHours}h</Text></Text>
            </View>
            <View style={styles.miniRing}><Text style={styles.miniRingText}>{Math.round(totalHours / totalTargetHours * 100)}%</Text></View>
          </View>
          <View style={styles.overviewTrack}><View style={[styles.overviewFill, { width: `${Math.min(100, totalHours / totalTargetHours * 100)}%` }]} /></View>
          <Text style={styles.overviewFoot}>{remaining.toFixed(1)} hours remaining across {topics.filter((topic) => topic.hoursDone < topic.hoursNeeded).length} active topics</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your topics</Text>
          <Text style={styles.sectionMeta}>Tap +30 min to log</Text>
        </View>

        <View style={styles.topicList}>
          {topics.map((topic, index) => {
            const progress = Math.min(100, topic.hoursDone / topic.hoursNeeded * 100);
            const done = progress >= 100;
            return (
              <View key={topic.id} style={[styles.topicRow, index === topics.length - 1 && styles.lastRow]}>
                <View style={[styles.topicIcon, { backgroundColor: `${topic.color}18` }]}>
                  <Feather name={done ? 'check' : 'activity'} size={17} color={topic.color} />
                </View>
                <View style={styles.topicMain}>
                  <View style={styles.topicTitleRow}>
                    <Text style={styles.topicName}>{topic.name}</Text>
                    <Text style={styles.topicHours}>{topic.hoursDone}/{topic.hoursNeeded}h</Text>
                  </View>
                  <View style={styles.topicTrack}><View style={[styles.topicFill, { width: `${progress}%`, backgroundColor: topic.color }]} /></View>
                  <Text style={styles.topicCaption}>{done ? 'Review complete' : `${topic.hoursNeeded - topic.hoursDone}h to target`}</Text>
                </View>
                <Pressable testID={`log-${topic.id}`} onPress={() => handleLog(topic.id)} disabled={done} style={({ pressed }) => [styles.addButton, done && styles.addButtonDone, pressed && styles.pressed]}>
                  <Feather name={done ? 'check' : 'plus'} size={16} color={done ? palette.mutedForeground : palette.primaryForeground} />
                </Pressable>
              </View>
            );
          })}
        </View>

        <View style={styles.noteCard}>
          <Feather name="clock" size={17} color={palette.accentForeground} />
          <View style={styles.noteCopy}>
            <Text style={styles.noteTitle}>{totalMinutes} minutes of deliberate work</Text>
            <Text style={styles.noteBody}>Every logged session nudges your next suggested block toward the weakest topic.</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.background },
  header: { paddingHorizontal: 20, paddingTop: 20 },
  eyebrow: { color: palette.primary, fontFamily: 'Inter_600SemiBold', fontSize: 11, letterSpacing: 1.4 },
  title: { color: palette.foreground, fontFamily: 'Inter_700Bold', fontSize: 29, letterSpacing: -0.8, marginTop: 8 },
  subtitle: { color: palette.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, marginTop: 8, maxWidth: 310 },
  overviewCard: { marginHorizontal: 20, marginTop: 24, padding: 18, backgroundColor: palette.card, borderRadius: 20, borderWidth: 1, borderColor: palette.border },
  overviewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  overviewLabel: { color: palette.mutedForeground, fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 1 },
  overviewNumber: { color: palette.foreground, fontFamily: 'Inter_700Bold', fontSize: 31, letterSpacing: -1.1, marginTop: 8 },
  overviewDenom: { color: palette.mutedForeground, fontFamily: 'Inter_500Medium', fontSize: 15, letterSpacing: 0 },
  miniRing: { width: 58, height: 58, borderRadius: 29, borderWidth: 6, borderColor: palette.accentForeground, alignItems: 'center', justifyContent: 'center' },
  miniRingText: { color: palette.accentForeground, fontFamily: 'Inter_700Bold', fontSize: 13 },
  overviewTrack: { height: 8, borderRadius: 4, backgroundColor: palette.muted, overflow: 'hidden', marginTop: 19 },
  overviewFill: { height: '100%', backgroundColor: palette.accentForeground, borderRadius: 4 },
  overviewFoot: { color: palette.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 10 },
  sectionHeader: { marginHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 28, marginBottom: 11 },
  sectionTitle: { color: palette.foreground, fontFamily: 'Inter_700Bold', fontSize: 19, letterSpacing: -0.3 },
  sectionMeta: { color: palette.mutedForeground, fontFamily: 'Inter_500Medium', fontSize: 11 },
  topicList: { marginHorizontal: 20, paddingHorizontal: 15, backgroundColor: palette.card, borderWidth: 1, borderColor: palette.border, borderRadius: 20 },
  topicRow: { minHeight: 84, borderBottomWidth: 1, borderBottomColor: palette.border, flexDirection: 'row', alignItems: 'center', gap: 11 },
  lastRow: { borderBottomWidth: 0 },
  topicIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  topicMain: { flex: 1 },
  topicTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  topicName: { color: palette.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  topicHours: { color: palette.mutedForeground, fontFamily: 'Inter_500Medium', fontSize: 11 },
  topicTrack: { height: 6, borderRadius: 3, backgroundColor: palette.muted, overflow: 'hidden', marginTop: 9 },
  topicFill: { height: '100%', borderRadius: 3 },
  topicCaption: { color: palette.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 10, marginTop: 6 },
  addButton: { width: 30, height: 30, borderRadius: 15, backgroundColor: palette.primary, alignItems: 'center', justifyContent: 'center' },
  addButtonDone: { backgroundColor: palette.muted },
  pressed: { opacity: 0.75, transform: [{ scale: 0.94 }] },
  noteCard: { marginHorizontal: 20, marginTop: 16, padding: 16, borderRadius: 18, backgroundColor: palette.accent, flexDirection: 'row', alignItems: 'flex-start' },
  noteCopy: { flex: 1, marginLeft: 11 },
  noteTitle: { color: palette.accentForeground, fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  noteBody: { color: '#8D5A2A', fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 16, marginTop: 4 },
});