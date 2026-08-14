const MYSTERIES = [
    {
        id: 'COUNTERFEIT_CURE',
        title: 'The Counterfeit Cure',
        milTheme: 'Medical Misinformation',
        narrativeIntro: 'A mysterious herbal cure has been circulating through Dusk Village. Residents are falling ill, but the source remains unknown...',
        fragments: {
            claim: {
                id: 'frag_cure_claim',
                objectName: 'A torn flyer',
                title: 'Herbal Cure Flyer',
                description: 'A promotional flyer making false claims about an unregulated herbal cure.',
                clueText: 'Take this to the Library to verify the claim, then deliver to Village Hall!',
                iconAsset: 'ico_frag_cure_claim'
            },
            context: {
                id: 'frag_cure_context',
                objectName: 'A student health log',
                title: 'Student Health Ledger',
                description: 'A school log showing students falling ill immediately after consuming the supplement.',
                clueText: 'Verify at the Library, then deliver to Village Hall Archive!',
                iconAsset: 'ico_frag_cure_context'
            },
            source: {
                id: 'frag_cure_source',
                objectName: 'An official medical registry',
                title: 'Medical Fraud Registry',
                description: 'Official registry proving the practitioner is a documented fraud operating without a license.',
                clueText: 'Verify at the Library and deliver the final proof to Village Hall!',
                iconAsset: 'ico_frag_cure_source'
            }
        }
    },
    {
        id: 'SILENT_HALLWAYS',
        title: 'The Silent Hallways',
        milTheme: 'Online Harassment',
        narrativeIntro: 'A student has vanished from the halls. Whispers of digital harassment echo through the village...',
        fragments: {
            claim: {
                id: 'frag_hallways_claim',
                objectName: 'A crumpled printout',
                title: 'Slanderous Messages',
                description: 'Printed copies of slanderous digital messages targeted at a student.',
                clueText: 'Take this to the Library to verify the claim, then deliver to Village Hall!',
                iconAsset: 'ico_frag_hallways_claim'
            },
            context: {
                id: 'frag_hallways_context',
                objectName: 'A diary page',
                title: 'Unsent Diary Entries',
                description: 'Personal diary entries detailing severe distress and targeted bullying.',
                clueText: 'Verify at the Library, then deliver to Village Hall Archive!',
                iconAsset: 'ico_frag_hallways_context'
            },
            source: {
                id: 'frag_hallways_source',
                objectName: 'A network log printout',
                title: 'IP Address Trace',
                description: 'Digital audit trail linking the harassment directly to a specific terminal in town.',
                clueText: 'Verify at the Library and deliver the final proof to Village Hall!',
                iconAsset: 'ico_frag_hallways_source'
            }
        }
    },
    {
        id: 'BREAKING_POINT',
        title: 'The Breaking Point',
        milTheme: 'Cyberbullying Awareness',
        narrativeIntro: 'A resident has filed an unexplained leave of absence. Something drove them to the breaking point...',
        fragments: {
            claim: {
                id: 'frag_breakpoint_claim',
                objectName: 'A signed leave form',
                title: 'Leave of Absence Form',
                description: 'A sudden leave of absence document citing unbearable workplace hostility.',
                clueText: 'Take this to the Library to verify the claim, then deliver to Village Hall!',
                iconAsset: 'ico_frag_breakpoint_claim'
            },
            context: {
                id: 'frag_breakpoint_context',
                objectName: 'A counselor notebook',
                title: 'Counselor Session Log',
                description: 'Counselor notes detailing systematic social exclusion and fabricated rumors.',
                clueText: 'Verify at the Library, then deliver to Village Hall Archive!',
                iconAsset: 'ico_frag_breakpoint_context'
            },
            source: {
                id: 'frag_breakpoint_source',
                objectName: 'An encrypted chat export',
                title: 'Group Chat Archive',
                description: 'Exported chat archive proving a coordinated group campaign to oust the resident.',
                clueText: 'Verify at the Library and deliver the final proof to Village Hall!',
                iconAsset: 'ico_frag_breakpoint_source'
            }
        }
    },
    {
        id: 'ILLUSORY_TRUTH',
        title: 'The Illusory Truth',
        milTheme: 'Deepfakes & Manipulation',
        narrativeIntro: 'A scandalous photograph of a village official has surfaced. But is it real?',
        fragments: {
            claim: {
                id: 'frag_illusion_claim',
                objectName: 'A glossy photo print',
                title: 'Scandalous Photograph',
                description: 'A printed photograph depicting a compromised village official.',
                clueText: 'Take this to the Library to verify the claim, then deliver to Village Hall!',
                iconAsset: 'ico_frag_illusion_claim'
            },
            context: {
                id: 'frag_illusion_context',
                objectName: 'A software receipt',
                title: 'AI Editing Software Invoice',
                description: 'Invoice for digital face-swapping software purchased days before the leak.',
                clueText: 'Verify at the Library, then deliver to Village Hall Archive!',
                iconAsset: 'ico_frag_illusion_context'
            },
            source: {
                id: 'frag_illusion_source',
                objectName: 'A memory card',
                title: 'Original Camera RAW Metadata',
                description: 'Cryptographic EXIF metadata proving the photo was synthetically generated.',
                clueText: 'Verify at the Library and deliver the final proof to Village Hall!',
                iconAsset: 'ico_frag_illusion_source'
            }
        }
    },
    {
        id: 'EMPTY_VAULT',
        title: 'The Empty Vault',
        milTheme: 'Phishing & Digital Scams',
        narrativeIntro: 'Residents are receiving urgent payment notices. Savings accounts are being drained overnight...',
        fragments: {
            claim: {
                id: 'frag_vault_claim',
                objectName: 'An urgent red notice',
                title: 'Urgent Payment Demand',
                description: 'A fraudulent demand claiming immediate seizure of village assets.',
                clueText: 'Take this to the Library to verify the claim, then deliver to Village Hall!',
                iconAsset: 'ico_frag_vault_claim'
            },
            context: {
                id: 'frag_vault_context',
                objectName: 'A bank transfer slip',
                title: 'Unauthorized Wire Transfer',
                description: 'Transaction record showing funds diverted to an unverified off-shore routing number.',
                clueText: 'Verify at the Library, then deliver to Village Hall Archive!',
                iconAsset: 'ico_frag_vault_context'
            },
            source: {
                id: 'frag_vault_source',
                objectName: 'A security report',
                title: 'Cybercrime Syndicate Dossier',
                description: 'Federal alert identifying the recipient account as an active phishing network.',
                clueText: 'Verify at the Library and deliver the final proof to Village Hall!',
                iconAsset: 'ico_frag_vault_source'
            }
        }
    }
];

const DECOY_FRAGMENTS_POOL = [
    { objectName: 'A grocery receipt', title: 'Ordinary Grocery Receipt', description: 'Just bread, milk, and apples. Completely unrelated to any mystery.' },
    { objectName: 'A torn postcard', title: 'Scenic Holiday Postcard', description: 'A vacation greeting from another town. Contains no relevant information.' },
    { objectName: 'A coffee shop bill', title: 'Cafe Invoice', description: 'An order of two hot chocolates and cinnamon rolls. Irrelevant.' },
    { objectName: 'An old bus ticket', title: 'Expired Transit Pass', description: 'A commuter ticket from three months ago. Not related to the case.' },
    { objectName: 'A lost homework sheet', title: 'Algebra Homework', description: 'A solved math worksheet with a B+ grade. Nothing suspicious.' },
    { objectName: 'A bakery coupon', title: 'Discount Bakery Coupon', description: 'Buy one loaf get one free. Has no connection to the village mystery.' },
    { objectName: 'A weather forecast clipping', title: 'Old Newspaper Clipping', description: 'A forecast predicting rain last Tuesday. Completely ordinary.' }
];

module.exports = { MYSTERIES, DECOY_FRAGMENTS_POOL };
