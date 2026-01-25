
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding user settings...');
    const userId = 'user_2sC1I1Q1x1Q1x1Q1x1Q1x1Q1'; // Assuming single user/admin or getting first user

    // Try to find the first user if ID is not known, or just update the first row
    const firstUser = await prisma.user.findFirst();

    if (!firstUser) {
        console.log('No user found to seed settings for.');
        return;
    }

    const settings = {
        userId: firstUser.id,
        tonWalletAddress: 'UQCEteRJDa9--KaeMmG8lCaxTn3NDlRz4BdDVsCP3P1ScJdr',
        tonWalletMnemonic: 'verb push toddler execute oil pigeon stable ceiling swift impose shed retreat vessel spoon wrist chuckle metal deer carry derive program adapt picture minute',
        fragmentHash: '390bc6dad2e1e75434',
        fragmentCookie: 'stel_ssid=30d08c4d6c7bfb8cc4_15772389599455901386; stel_dt=-180; stel_token=d1a6a1e783c54d2bb92a60617de2ab30d1a6a1fdd1a6aac787b6e50370dad016e1768; stel_ton_token=TzivBNbGKAGbwXtaaRdNy8_5M643D6o_d0UbXjVQs25ghazRAlBzC3mIMeBRSjVKOt6oL3BVKfk3txry57Df4lFOrlGXsK2HNXRoJTbgGQe6kWogjCZ3cxGB9aUJVGotleTSW9KhC4lJ-4w_gXu6-hnOA362ajKI7dJPjsk94zcwUoYxTmnby_zjZX1-9CvlZRPtDKyK',
        tonApiKey: 'AGAI6AUZ2EDXTVQAAAAHOKV6COUKTTNGHX5P5KGAX2EMNIWPA2SGZ5NAZEN7XBYSGRWNEYA'
    };

    // Upsert settings
    const existing = await prisma.systemSettings.findUnique({
        where: { userId: firstUser.id },
    });

    if (existing) {
        await prisma.systemSettings.update({
            where: { userId: firstUser.id },
            data: settings
        });
        console.log('Settings updated!');
    } else {
        await prisma.systemSettings.create({
            data: settings
        });
        console.log('Settings created!');
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
