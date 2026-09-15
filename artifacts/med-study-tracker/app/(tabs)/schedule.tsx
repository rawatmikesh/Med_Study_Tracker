import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import colors from '@/constants/colors';
import { DAYS, Day, formatHour, getToday, useStudy } from '@/context/StudyContext';

const palette = colors.light;

export default function ScheduleScreen() {
  const insets = useSafeAreaInsets();
  const { dayPlan, toggleBlock, isBlockComplete } = useStudy();
  const [selectedDay, setSelectedDay] = useState<Day>(getToday());
  const plan = dayPlan(selectedDay);

  const selectDay = (day: Day) => {
    setSelectedDay(day);
    Haptics.selectionAsync().catch(() => undefined);
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>WEEK VIEW</Text>
          <Text style={styles.title}>Your schedule</Text>
          <Text style={styles.subtitle}>Fixed commitments first. Study fits around real life.</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayRail}>
          {DAYS.map((day) => {
            const active = day === selectedDay;
            return (
              <Pressable key={day} testID={`day-${day}`} onPress={() => selectDay(day)} style={({ pressed }) => [styles.dayPill, active && styles.activeDay, pressed && styles.pressed]}>
                <Text style={[styles.dayText, active && styles.activeDayText]}>{day}</Text>
                <Text style={[styles.dayCount, active && styles.activeDayText]}>{dayPlan(day).fixed.length}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.summaryEyebrow}>{selectedDay.toUpperCase()} PLAN</Text>
            <Text style={styles.summaryTitle}>{plan.overloaded ? 'Keep it light today.' : `${plan.windows.length} open windows`}</Text>
            <Text style={styles.summaryBody}>{plan.overloaded ? 'A long rotation is already a full day. Recovery is part of the plan.' : 'One realistic study block is reserved for your lowest-progress topic.'}</Text>
          </View>
          <View style={[styles.summaryIcon, { backgroundColor: plan.overloaded ? palette.accent : palette.secondary }]}>
            <Feather name={plan.overloaded ? 'moon' : 'sun'} size={21} color={plan.overloaded ? palette.accentForeground : palette.primary} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Fixed commitments</Text>
        {plan.fixed.length ? plan.fixed.map((block) => {
          const complete = isBlockComplete(block.id);
          return (
            <Pressable key={block.id} onPress={() => toggleBlock(block.id)} style={({ pressed }) => [styles.blockRow, complete && styles.completeBlock, pressed && styles.pressed]}>
              <View style={[styles.timelineDot, { backgroundColor: block.type === 'shift' ? palette.primary : palette.accentForeground }]} />
              <View style={styles.blockTime}>
                <Text style={styles.blockStart}>{formatHour(block.start)}</Text>
                <Text style={styles.blockEnd}>{formatHour(block.end)}</Text>
              </View>
              <View style={styles.blockCopy}>
                <Text style={[styles.blockTitle, complete && styles.completeText]}>{block.label}</Text>
                <Text style={styles.blockType}>{block.type === 'shift' ? 'Clinical shift' : 'Teaching'}</Text>
              </View>
              <View style={[styles.check, complete && styles.checked]}>
                {complete && <Feather name="check" size={14} color={palette.primaryForeground} />}
              </View>
            </Pressable>
          );
        }) : (
          <View style={styles.emptyCard}>
            <Feather name="coffee" size={20} color={palette.mutedForeground} />
            <Text style={styles.emptyTitle}>No fixed commitments</Text>
            <Text style={styles.emptyBody}>A clean day for deeper work or actual time off.</Text>
          </View>
        )}

        <Text style={[styles.sectionTitle, { marginTop: 28 }]}>Suggested block</Text>
        <View style={styles.studyCard}>
          <View style={styles.studyIcon}><Feather name="book-open" size={19} color={palette.primary} /></View>
          <View style={styles.studyCopy}>
            <Text style={styles.studyTitle}>{plan.overloaded ? 'Recovery window' : `Study ${plan.topic.name}`}</Text>
            <Text style={styles.studyTime}>{plan.studyBlock ? `${formatHour(plan.studyBlock.start)} – ${formatHour(plan.studyBlock.end)}` : 'No target scheduled'}</Text>
          </View>
          <Text style={styles.studyDuration}>{plan.studyBlock ? '90 min' : 'Rest'}</Text>
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
  subtitle: { color: palette.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, marginTop: 8, maxWidth: 300 },
  dayRail: { paddingHorizontal: 20, paddingVertical: 22, gap: 8 },
  dayPill: { width: 49, height: 56, borderRadius: 16, backgroundColor: palette.card, borderWidth: 1, borderColor: palette.border, alignItems: 'center', justifyContent: 'center' },
  activeDay: { backgroundColor: palette.primary, borderColor: palette.primary },
  dayText: { color: palette.mutedForeground, fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  dayCount: { color: palette.foreground, fontFamily: 'Inter_700Bold', fontSize: 17, marginTop: 4 },
  activeDayText: { color: palette.primaryForeground },
  pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
  summaryCard: { marginHorizontal: 20, padding: 18, borderRadius: 20, backgroundColor: palette.primary, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryEyebrow: { color: '#A8D6D1', fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 1.1 },
  summaryTitle: { color: palette.primaryForeground, fontFamily: 'Inter_700Bold', fontSize: 19, marginTop: 6 },
  summaryBody: { color: '#D5E9E6', fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 16, maxWidth: 245, marginTop: 5 },
  summaryIcon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { color: palette.foreground, fontFamily: 'Inter_700Bold', fontSize: 18, marginHorizontal: 20, marginTop: 28, marginBottom: 11 },
  blockRow: { marginHorizontal: 20, minHeight: 76, backgroundColor: palette.card, borderWidth: 1, borderColor: palette.border, borderRadius: 18, marginBottom: 9, padding: 14, flexDirection: 'row', alignItems: 'center' },
  completeBlock: { backgroundColor: palette.secondary, borderColor: '#B8D8D4' },
  timelineDot: { width: 9, height: 9, borderRadius: 5, marginRight: 12 },
  blockTime: { width: 55 },
  blockStart: { color: palette.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  blockEnd: { color: palette.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 4 },
  blockCopy: { flex: 1, paddingLeft: 4 },
  blockTitle: { color: palette.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  completeText: { textDecorationLine: 'line-through', color: palette.mutedForeground },
  blockType: { color: palette.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 5 },
  check: { width: 25, height: 25, borderRadius: 13, borderWidth: 1.5, borderColor: palette.border, alignItems: 'center', justifyContent: 'center' },
  checked: { backgroundColor: palette.primary, borderColor: palette.primary },
  emptyCard: { marginHorizontal: 20, padding: 22, borderRadius: 18, backgroundColor: palette.muted, alignItems: 'center' },
  emptyTitle: { color: palette.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 14, marginTop: 10 },
  emptyBody: { color: palette.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 5, textAlign: 'center' },
  studyCard: { marginHorizontal: 20, padding: 15, borderRadius: 18, backgroundColor: palette.card, borderWidth: 1, borderColor: palette.border, flexDirection: 'row', alignItems: 'center' },
  studyIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: palette.secondary, alignItems: 'center', justifyContent: 'center' },
  studyCopy: { flex: 1, marginLeft: 12 },
  studyTitle: { color: palette.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  studyTime: { color: palette.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 4 },
  studyDuration: { color: palette.primary, fontFamily: 'Inter_600SemiBold', fontSize: 12 },
});