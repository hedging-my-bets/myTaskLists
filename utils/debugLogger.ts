
/**
 * Debug Logger Utility
 * Provides structured logging for debugging widget synchronization issues
 */

export const logSeparator = (title: string) => {
  const line = '='.repeat(50);
  console.log(`\n${line}`);
  console.log(`  ${title}`);
  console.log(`${line}\n`);
};

export const logSection = (title: string) => {
  console.log(`\n--- ${title} ---`);
};

export const logData = (label: string, data: any) => {
  console.log(`${label}:`, JSON.stringify(data, null, 2));
};

export const logTaskSummary = (tasks: any[]) => {
  console.log('\n📋 Task Summary:');
  console.log(`   Total: ${tasks.length}`);
  
  const done = tasks.filter(t => t.isDone).length;
  const skipped = tasks.filter(t => t.isSkipped).length;
  const missed = tasks.filter(t => t.isMissed).length;
  const pending = tasks.filter(t => !t.isDone && !t.isSkipped && !t.isMissed).length;
  
  console.log(`   ✅ Done: ${done}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Missed: ${missed}`);
  console.log(`   ⏳ Pending: ${pending}`);
};

export const logPetState = (petState: any) => {
  console.log('\n🐾 Pet State:');
  console.log(`   XP: ${petState.xp}`);
  console.log(`   Stage: ${petState.stageIndex}`);
};

export const logWidgetState = (widgetState: any) => {
  console.log('\n📱 Widget State:');
  console.log(`   Tasks: ${widgetState.todayTasks?.length || 0}`);
  console.log(`   Current Index: ${widgetState.currentIndex}`);
  console.log(`   Pet XP: ${widgetState.petState?.xp || 0}`);
  console.log(`   Pet Stage: ${widgetState.petState?.stageIndex || 0}`);
  console.log(`   Grace Minutes: ${widgetState.graceMinutes}`);
  console.log(`   Last Updated: ${widgetState.lastUpdated ? new Date(widgetState.lastUpdated).toISOString() : 'N/A'}`);
};

export const logError = (context: string, error: any) => {
  console.error(`\n❌ ERROR in ${context}:`);
  console.error(`   Message: ${error.message || error}`);
  if (error.stack) {
    console.error(`   Stack: ${error.stack}`);
  }
};

export const logTimestamp = (label: string) => {
  const now = new Date();
  console.log(`⏰ ${label}: ${now.toISOString()} (${now.toLocaleTimeString()})`);
};
