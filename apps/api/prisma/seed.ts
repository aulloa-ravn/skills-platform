import { PrismaClient } from '@prisma/client';
import { seedSkills } from './seeds/skills.seed';
import { seedSampleData } from './seeds/sample-data.seed';

const prisma = new PrismaClient();

async function main() {
  const startTime = Date.now();

  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   DATABASE SEEDING ORCHESTRATOR       ║');
  console.log('╚════════════════════════════════════════╝\n');

  try {
    // Seed skills taxonomy (136 skills)
    await seedSkills(prisma);

    // Seed sample data (profiles, projects, assignments, etc.)
    await seedSampleData(prisma);

    const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   ALL SEEDING COMPLETED SUCCESSFULLY  ║');
    console.log('╚════════════════════════════════════════╝');
    console.log(`Total execution time: ${totalElapsed} seconds\n`);
  } catch (error) {
    console.error('\n╔════════════════════════════════════════╗');
    console.error('║   SEEDING FAILED                      ║');
    console.error('╚════════════════════════════════════════╝\n');
    console.error('Error:', error);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
