const prisma = require('../config/db');

async function getDashboardData(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const progressRows = await prisma.progress.findMany({ where: { userId } });
  const courseProgress = {};
  progressRows.forEach((p) => {
    courseProgress[p.language] = {
      completedLevels: p.completedLevels.length,
      totalLevels: p.totalLevels,
    };
  });

  return {
    level: user.level,
    xp: user.xp,
    xpIntoLevel: user.xp % 100,
    xpForNextLevel: 100,
    streak: user.streak,
    badges: user.badges || [],
    certificates: await prisma.certificate.findMany({ where: { userId } }),
    courseProgress,
  };
}

module.exports = { getDashboardData };