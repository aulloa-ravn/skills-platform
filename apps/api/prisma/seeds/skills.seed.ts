import { PrismaClient, Discipline } from '@prisma/client';

export async function seedSkills(prisma: PrismaClient): Promise<void> {
  console.log('Starting skills taxonomy seeding...');

  let createdCount = 0;
  let updatedCount = 0;

  const upsertSkill = async (name: string, discipline: Discipline) => {
    const result = await prisma.skill.upsert({
      where: { name },
      update: { discipline },
      create: {
        name,
        discipline,
        isActive: true,
      },
    });

    // Check if this was a create or update by seeing if createdAt and updatedAt differ
    const isNewRecord =
      result.createdAt.getTime() === result.updatedAt.getTime();

    if (isNewRecord) {
      createdCount++;
      console.log(`Created: ${name} (${discipline})`);
    } else {
      updatedCount++;
      console.log(`Updated: ${name} (${discipline})`);
    }

    return result;
  };

  // Frontend Skills (8)
  await upsertSkill('React', Discipline.FRONTEND);
  await upsertSkill('Next.js', Discipline.FRONTEND);
  await upsertSkill('Vue.js', Discipline.FRONTEND);
  await upsertSkill('Angular', Discipline.FRONTEND);
  await upsertSkill('Svelte', Discipline.FRONTEND);
  await upsertSkill('Nuxt.js', Discipline.FRONTEND);
  await upsertSkill('Electron', Discipline.FRONTEND);
  await upsertSkill('Blazor', Discipline.FRONTEND);

  // Styling Skills (6)
  await upsertSkill('HTML', Discipline.STYLING);
  await upsertSkill('Tailwind CSS', Discipline.STYLING);
  await upsertSkill('CSS', Discipline.STYLING);
  await upsertSkill('Sass/SCSS', Discipline.STYLING);
  await upsertSkill('Styled Components', Discipline.STYLING);
  await upsertSkill('Bootstrap', Discipline.STYLING);

  // Language Skills (18)
  await upsertSkill('TypeScript', Discipline.LANGUAGES);
  await upsertSkill('JavaScript', Discipline.LANGUAGES);
  await upsertSkill('Python', Discipline.LANGUAGES);
  await upsertSkill('Java', Discipline.LANGUAGES);
  await upsertSkill('C#', Discipline.LANGUAGES);
  await upsertSkill('C++', Discipline.LANGUAGES);
  await upsertSkill('C', Discipline.LANGUAGES);
  await upsertSkill('Go', Discipline.LANGUAGES);
  await upsertSkill('Rust', Discipline.LANGUAGES);
  await upsertSkill('PHP', Discipline.LANGUAGES);
  await upsertSkill('Ruby', Discipline.LANGUAGES);
  await upsertSkill('Objective-C', Discipline.LANGUAGES);
  await upsertSkill('Swift', Discipline.LANGUAGES);
  await upsertSkill('Kotlin', Discipline.LANGUAGES);
  await upsertSkill('Dart', Discipline.LANGUAGES);
  await upsertSkill('Scala', Discipline.LANGUAGES);
  await upsertSkill('Elixir', Discipline.LANGUAGES);
  await upsertSkill('Erlang', Discipline.LANGUAGES);

  // Backend Skills (12)
  await upsertSkill('Node.js', Discipline.BACKEND);
  await upsertSkill('Express.js', Discipline.BACKEND);
  await upsertSkill('Nest.js', Discipline.BACKEND);
  await upsertSkill('Django', Discipline.BACKEND);
  await upsertSkill('Flask', Discipline.BACKEND);
  await upsertSkill('FastAPI', Discipline.BACKEND);
  await upsertSkill('Spring Boot', Discipline.BACKEND);
  await upsertSkill('.NET', Discipline.BACKEND);
  await upsertSkill('Laravel', Discipline.BACKEND);
  await upsertSkill('Ruby on Rails', Discipline.BACKEND);
  await upsertSkill('Gin', Discipline.BACKEND);
  await upsertSkill('Fiber', Discipline.BACKEND);

  // Database Skills (10)
  await upsertSkill('PostgreSQL', Discipline.DATABASE);
  await upsertSkill('MySQL', Discipline.DATABASE);
  await upsertSkill('MongoDB', Discipline.DATABASE);
  await upsertSkill('Redis', Discipline.DATABASE);
  await upsertSkill('SQLite', Discipline.DATABASE);
  await upsertSkill('Cassandra', Discipline.DATABASE);
  await upsertSkill('DynamoDB', Discipline.DATABASE);
  await upsertSkill('Neo4j', Discipline.DATABASE);
  await upsertSkill('InfluxDB', Discipline.DATABASE);
  await upsertSkill('Elasticsearch', Discipline.DATABASE);

  // Cloud Skills (14)
  await upsertSkill('AWS', Discipline.CLOUD);
  await upsertSkill('Google Cloud', Discipline.CLOUD);
  await upsertSkill('Microsoft Azure', Discipline.CLOUD);
  await upsertSkill('Vercel', Discipline.CLOUD);
  await upsertSkill('Netlify', Discipline.CLOUD);
  await upsertSkill('Heroku', Discipline.CLOUD);
  await upsertSkill('DigitalOcean', Discipline.CLOUD);
  await upsertSkill('Linode', Discipline.CLOUD);
  await upsertSkill('Railway', Discipline.CLOUD);
  await upsertSkill('Render', Discipline.CLOUD);
  await upsertSkill('Supabase', Discipline.CLOUD);
  await upsertSkill('Firebase', Discipline.CLOUD);
  await upsertSkill('PlanetScale', Discipline.CLOUD);
  await upsertSkill('Cloudflare', Discipline.CLOUD);

  // DevOps Skills (10)
  await upsertSkill('Docker', Discipline.DEVOPS);
  await upsertSkill('Kubernetes', Discipline.DEVOPS);
  await upsertSkill('Terraform', Discipline.DEVOPS);
  await upsertSkill('Ansible', Discipline.DEVOPS);
  await upsertSkill('Jenkins', Discipline.DEVOPS);
  await upsertSkill('GitHub Actions', Discipline.DEVOPS);
  await upsertSkill('GitLab CI', Discipline.DEVOPS);
  await upsertSkill('CircleCI', Discipline.DEVOPS);
  await upsertSkill('Nginx', Discipline.DEVOPS);
  await upsertSkill('Apache', Discipline.DEVOPS);

  // Tools Skills (4)
  await upsertSkill('Git', Discipline.TOOLS);
  await upsertSkill('GitHub', Discipline.TOOLS);
  await upsertSkill('GitLab', Discipline.TOOLS);
  await upsertSkill('Bitbucket', Discipline.TOOLS);

  // Design Skills (5)
  await upsertSkill('Figma', Discipline.DESIGN);
  await upsertSkill('Adobe XD', Discipline.DESIGN);
  await upsertSkill('Sketch', Discipline.DESIGN);
  await upsertSkill('Photoshop', Discipline.DESIGN);
  await upsertSkill('Illustrator', Discipline.DESIGN);

  // API Skills (6)
  await upsertSkill('GraphQL', Discipline.API);
  await upsertSkill('REST API', Discipline.API);
  await upsertSkill('Apollo', Discipline.API);
  await upsertSkill('Relay', Discipline.API);
  await upsertSkill('tRPC', Discipline.API);
  await upsertSkill('jQuery', Discipline.API);

  // Testing Skills (9)
  await upsertSkill('Jest', Discipline.TESTING);
  await upsertSkill('Cypress', Discipline.TESTING);
  await upsertSkill('Playwright', Discipline.TESTING);
  await upsertSkill('Testing Library', Discipline.TESTING);
  await upsertSkill('Manual QA', Discipline.TESTING);
  await upsertSkill('Vitest', Discipline.TESTING);
  await upsertSkill('Selenium', Discipline.TESTING);
  await upsertSkill('JUnit', Discipline.TESTING);
  await upsertSkill('Espresso', Discipline.TESTING);

  // Performance Skills (2)
  await upsertSkill('JMeter', Discipline.PERFORMANCE);
  await upsertSkill('K6', Discipline.PERFORMANCE);

  // Security Skills (2)
  await upsertSkill('SonarQube', Discipline.SECURITY);
  await upsertSkill('Snyk', Discipline.SECURITY);

  // Mobile Skills (6)
  await upsertSkill('React Native', Discipline.MOBILE);
  await upsertSkill('Android', Discipline.MOBILE);
  await upsertSkill('iOS', Discipline.MOBILE);
  await upsertSkill('Flutter', Discipline.MOBILE);
  await upsertSkill('Ionic', Discipline.MOBILE);
  await upsertSkill('Expo', Discipline.MOBILE);

  // iOS Skills (2)
  await upsertSkill('SwiftUI', Discipline.IOS);
  await upsertSkill('UIKit', Discipline.IOS);

  // Android Skills (3)
  await upsertSkill('Jetpack Compose', Discipline.ANDROID);
  await upsertSkill('XML Layouts', Discipline.ANDROID);
  await upsertSkill('Gradle', Discipline.ANDROID);

  // Build Tools Skills (6)
  await upsertSkill('Webpack', Discipline.BUILD_TOOLS);
  await upsertSkill('Vite', Discipline.BUILD_TOOLS);
  await upsertSkill('Rollup', Discipline.BUILD_TOOLS);
  await upsertSkill('Parcel', Discipline.BUILD_TOOLS);
  await upsertSkill('Turborepo', Discipline.BUILD_TOOLS);
  await upsertSkill('Lerna', Discipline.BUILD_TOOLS);

  // No-Code Skills (4)
  await upsertSkill('Webflow', Discipline.NO_CODE);
  await upsertSkill('Framer', Discipline.NO_CODE);
  await upsertSkill('Power Apps', Discipline.NO_CODE);
  await upsertSkill('Workfront Fusion', Discipline.NO_CODE);

  // Other Skills (9)
  await upsertSkill('Machine Learning', Discipline.OTHER);
  await upsertSkill('Shopify', Discipline.OTHER);
  await upsertSkill('WebAssembly', Discipline.OTHER);
  await upsertSkill('Socket.io', Discipline.OTHER);
  await upsertSkill('Stripe', Discipline.OTHER);
  await upsertSkill('Storybook', Discipline.OTHER);
  await upsertSkill('UiPath', Discipline.OTHER);
  await upsertSkill('Unity', Discipline.OTHER);
  await upsertSkill('Roku', Discipline.OTHER);

  const totalSkills = createdCount + updatedCount;
  console.log(
    `\nSuccessfully seeded ${totalSkills} skills (${createdCount} created, ${updatedCount} updated)`,
  );
}
