import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import colors from '@/constants/colors';
import { formatHour, getToday, useStudy } from '@/context/StudyContext';

const palette = colors.light;

function ProgressRing({ percent }: { percent: number }) {
  return (
    <View style={styles.ring}>
      <View style={styles.ringInner}>
        <Text style={styles.ringValue}>{percent}%</Text>
        <Text style={styles.ringLabel}>complete</Text>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { topics, totalMinutes, totalHours, totalTargetHours, completionPercent, dayPlan, logStudy } = useStudy();
  const today = getToday();
  const plan = dayPlan(today);
  const [logged, setLogged] = useState(false);
  const examDate = useMemo(() => new Date(new Date().getFullYear(), 10, 14), []);
  const daysUntilExam = Math.max(0, Math.ceil((examDate.getTime() - Date.now()) / 86400000));
  const averageProgress = topics.length ? Math.round(topics.reduce((sum, topic) => sum + topic.hoursDone / topic.hoursNeeded, 0) / topics.length * 100) : 0;

  const handleLog = () => {
    logStudy(plan.topic.id, 0.5);
    setLogged(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>PULSE / {today.toUpperCase()}</Text>
            <Text style={styles.greeting}>Good morning.</Text>
          </View>
          <View style={styles.avatar}><Text style={styles.avatarText}>M</Text></View>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroEyebrow}>YOUR WEEK, IN FOCUS</Text>
            <Text style={styles.heroTitle}>Small sessions{'\n'}compound.</Text>
            <Text style={styles.heroBody}>{totalHours.toFixed(1)} of {totalTargetHours} study hours logged across your active topics.</Text>
          </View>
          <ProgressRing percent={completionPercent} />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today</Text>
          <Text style={styles.sectionMeta}>{plan.overloaded ? 'recovery day' : 'protected time found'}</Text>
        </View>

        <View style={styles.todayCard}>
          <View style={styles.todayTop}>
            <View style={[styles.iconSquare, { backgroundColor: plan.overloaded ? palette.accent : palette.secondary }]}>
              <Feather name={plan.overloaded ? 'moon' : 'book-open'} size={19} color={plan.overloaded ? palette.accentForeground : palette.primary} />
            </View>
            <View style={styles.todayHeading}>
              <Text style={styles.todayLabel}>{plan.overloaded ? 'Long rotation' : 'Suggested study block'}</Text>
              <Text style={styles.todayTitle}>{plan.overloaded ? 'Protect your recovery' : `${formatHour(plan.studyBlock?.start ?? 18)} – ${formatHour(plan.studyBlock?.end ?? 19.5)}`}</Text>
            </View>
            <Feather name="more-horizontal" size={20} color={palette.mutedForeground} />
          </View>
          <View style={styles.divider} />
          <View style={styles.todayDetails}>
            <View>
              <Text style={styles.detailLabel}>{plan.overloaded ? `${plan.longestShift} hour shift` : 'Focus next'}</Text>
              <Text style={styles.detailValue}>{plan.overloaded ? 'No study target today' : plan.topic.name}</Text>
            </View>
            {plan.overloaded ? (
              <Feather name="heart" size={19} color={palette.accentForeground} />
            ) : (
              <Pressable testID="log-study" onPress={handleLog} style={({ pressed }) => [styles.logButton, pressed && styles.pressed]}>
                <Feather name={logged ? 'check' : 'plus'} size={16} color={palette.primaryForeground} />
                <Text style={styles.logButtonText}>{logged ? 'Logged' : 'Log 30 min'}</Text>
              </Pressable>
            )}
          </View>
        </View>

        <View style={styles.statRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{daysUntilExam}</Text>
            <Text style={styles.statLabel}>days to Step 2</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{totalMinutes}</Text>
            <Text style={styles.statLabel}>minutes logged</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{averageProgress}%</Text>
            <Text style={styles.statLabel}>topic average</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Topic pulse</Text>
          <Text style={styles.sectionMeta}>Step 2 CK</Text>
        </View>
        <View style={styles.topicList}>
          {topics.slice(0, 3).map((topic) => {
            const progress = Math.round(topic.hoursDone / topic.hoursNeeded * 100);
            return (
              <View key={topic.id} style={styles.topicRow}>
                <View style={[styles.topicDot, { backgroundColor: topic.color }]} />
                <Text style={styles.topicName}>{topic.name}</Text>
                <Text style={styles.topicHours}>{topic.hoursDone}/{topic.hoursNeeded}h</Text>
                <View style={styles.topicTrack}><View style={[styles.topicFill, { width: `${progress}%`, backgroundColor: topic.color }]} /></View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.background },
  content: { paddingHorizontal: 20, paddingTop: 18 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  eyebrow: { color: palette.primary, fontFamily: 'Inter_600SemiBold', fontSize: 11, letterSpacing: 1.4 },
  greeting: { color: palette.foreground, fontFamily: 'Inter_700Bold', fontSize: 28, letterSpacing: -0.8, marginTop: 7 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: palette.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: palette.primaryForeground, fontFamily: 'Inter_700Bold', fontSize: 16 },
  heroCard: { minHeight: 174, borderRadius: 24, padding: 22, backgroundColor: palette.primary, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', overflow: 'hidden' },
  heroCopy: { flex: 1, paddingRight: 10 },
  heroEyebrow: { color: '#A8D6D1', fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 1.2 },
  heroTitle: { color: palette.primaryForeground, fontFamily: 'Inter_700Bold', fontSize: 27, lineHeight: 31, letterSpacing: -0.7, marginTop: 10 },
  heroBody: { color: '#D5E9E6', fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18, marginTop: 10, maxWidth: 190 },
  ring: { width: 94, height: 94, borderRadius: 47, borderWidth: 8, borderColor: '#78AEA8', alignItems: 'center', justifyContent: 'center' },
  ringInner: { width: 74, height: 74, borderRadius: 37, backgroundColor: palette.primary, alignItems: 'center', justifyContent: 'center' },
  ringValue: { color: palette.primaryForeground, fontFamily: 'Inter_700Bold', fontSize: 20 },
  ringLabel: { color: '#BDE0DC', fontFamily: 'Inter_400Regular', fontSize: 9, marginTop: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 26, marginBottom: 11 },
  sectionTitle: { color: palette.foreground, fontFamily: 'Inter_700Bold', fontSize: 19, letterSpacing: -0.3 },
  sectionMeta: { color: palette.mutedForeground, fontFamily: 'Inter_500Medium', fontSize: 11 },
  todayCard: { backgroundColor: palette.card, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: palette.border },
  todayTop: { flexDirection: 'row', alignItems: 'center' },
  iconSquare: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  todayHeading: { flex: 1, marginLeft: 12 },
  todayLabel: { color: palette.mutedForeground, fontFamily: 'Inter_500Medium', fontSize: 11 },
  todayTitle: { color: palette.foreground, fontFamily: 'Inter_700Bold', fontSize: 16, marginTop: 4 },
  divider: { height: 1, backgroundColor: palette.border, marginVertical: 15 },
  todayDetails: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  detailLabel: { color: palette.mutedForeground, fontFamily: 'Inter_500Medium', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8 },
  detailValue: { color: palette.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 14, marginTop: 4 },
  logButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: palette.primary, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, gap: 6 },
  logButtonText: { color: palette.primaryForeground, fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  pressed: { opacity: 0.75, transform: [{ scale: 0.97 }] },
  statRow: { flexDirection: 'row', marginTop: 14, gap: 8 },
  stat: { flex: 1, backgroundColor: palette.muted, borderRadius: 16, paddingVertical: 13, paddingHorizontal: 10 },
  statValue: { color: palette.foreground, fontFamily: 'Inter_700Bold', fontSize: 18 },
  statLabel: { color: palette.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 10, marginTop: 4 },
  topicList: { backgroundColor: palette.card, borderRadius: 20, paddingHorizontal: 16, borderWidth: 1, borderColor: palette.border },
  topicRow: { minHeight: 50, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: palette.border },
  topicDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  topicName: { color: palette.foreground, fontFamily: 'Inter_500Medium', fontSize: 13, width: 82 },
  topicHours: { color: palette.mutedForeground, fontFamily: 'Inter_500Medium', fontSize: 11, width: 38 },
  topicTrack: { flex: 1, height: 6, backgroundColor: palette.muted, borderRadius: 3, overflow: 'hidden' },
  topicFill: { height: '100%', borderRadius: 3 },
});
