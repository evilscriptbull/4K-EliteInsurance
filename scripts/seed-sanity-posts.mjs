// One-time/re-runnable seed script: pushes blog post documents into Sanity.
// Run with: node scripts/seed-sanity-posts.mjs
//
// Two content sets:
// 1. The 6 posts migrated verbatim from the live Squarespace site
//    (eliteinsuranceknoxville.com/elite-insurance-blog) — already
//    previously published/approved content, so these seed as status
//    "published".
// 2. 6 new posts covering high-ROI lines (general liability, commercial
//    auto, boat, group life, workers' comp, builders risk) — net-new
//    AI-drafted marketing content, so per
//    guardrails.requireHumanReviewForHigherRiskRecommendations
//    (src/lib/compliance/guardrails.ts) these seed as status "draft".
//    They exist in Sanity for Chaz Goodin (agency.complianceApprover) to
//    review; flip `status` to "published" once approved and they'll appear
//    on /blog automatically.
process.loadEnvFile("C:\\Users\\cruze\\Code\\aiWork\\EliteInsurance\\.env.local");

import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: "2026-08-01",
  useCdn: false,
});

let keyCounter = 0;
function nextKey() {
  keyCounter += 1;
  return `k${keyCounter}`;
}
function span(text) {
  return { _type: "span", _key: nextKey(), text, marks: [] };
}
function toPortableText(sections) {
  return sections.flatMap((section) => {
    if (section.type === "heading") {
      return [
        {
          _type: "block",
          _key: nextKey(),
          style: section.level === 2 ? "h2" : "h3",
          markDefs: [],
          children: [span(section.text)],
        },
      ];
    }
    if (section.type === "list") {
      return section.items.map((item) => ({
        _type: "block",
        _key: nextKey(),
        style: "normal",
        listItem: "bullet",
        level: 1,
        markDefs: [],
        children: [span(item)],
      }));
    }
    return [
      {
        _type: "block",
        _key: nextKey(),
        style: "normal",
        markDefs: [],
        children: [span(section.text)],
      },
    ];
  });
}

function post({ slug, title, excerpt, author, publishedAt, insuranceLines, status, sourceUrl, sections }) {
  return {
    _id: `post-${slug}`,
    _type: "post",
    title,
    slug: { _type: "slug", current: slug },
    excerpt,
    author,
    publishedAt,
    insuranceLines,
    status,
    ...(sourceUrl ? { sourceUrl } : {}),
    body: toPortableText(sections),
  };
}

// ---------------------------------------------------------------------------
// Migrated posts (verbatim from the live site, status: published)
// ---------------------------------------------------------------------------

const migratedPosts = [
  post({
    slug: "hidden-risk-in-your-life-insurance-plan",
    title: "The Hidden Risk in Your Life Insurance Plan—and How to Fix It",
    excerpt:
      "A $2.5 million life insurance policy, owned the wrong way, can push an estate over the federal exemption limit. Here's how an Irrevocable Life Insurance Trust fixes that.",
    author: "Chaz Goodin",
    publishedAt: "2025-05-03T00:00:00Z",
    insuranceLines: ["life"],
    status: "published",
    sourceUrl:
      "https://eliteinsuranceknoxville.com/elite-insurance-blog/2025/5/3/the-hidden-risk-in-your-life-insurance-planand-how-to-fix-it",
    sections: [
      {
        type: "paragraph",
        text: "A local business owner came to us with a $2.5 million life insurance policy. His goal? To make sure his children could keep the family business running if he were to pass away.",
      },
      {
        type: "paragraph",
        text: "What he didn't realize was that because he personally owned the policy, the death benefit would be included in his estate—pushing it over the federal exemption limit and triggering a significant estate tax bill.",
      },
      {
        type: "paragraph",
        text: "By establishing an Irrevocable Life Insurance Trust (ILIT) and transferring the policy into it, we helped preserve the full benefit for his family. The funds were shielded from estate taxes, protected from creditors, and distributed according to his wishes, without probate delays or tax surprises!",
      },
      {
        type: "paragraph",
        text: "Life insurance is often thought of as a straightforward safety net, but without proper planning, it can have unintended consequences and be distributed in ways that damage futures. That's where an ILIT comes in.",
      },
      {
        type: "paragraph",
        text: "An ILIT is a specific kind of trust designed to own life insurance policies outside of your taxable estate. When used strategically, it offers several powerful benefits:",
      },
      {
        type: "list",
        items: [
          "Tax Efficiency: It keeps the death benefit out of your estate, potentially saving heirs from estate taxes.",
          "Asset Protection: Shields the funds from creditors and legal claims.",
          "Control Over Distribution: Allows you to decide how and when your beneficiaries receive the money.",
          "Privacy and Simplicity: Helps your family avoid the delays and the public process of probate.",
        ],
      },
      {
        type: "paragraph",
        text: "ILITs aren't just for the ultra-wealthy. They're a smart solution for all business owners and even families with large insurance policies or anyone who simply desires more control over how their life insurance benefits are used.",
      },
      {
        type: "paragraph",
        text: "If you're serious about protecting your legacy, message me and let's set up a time to talk. I can help you determine if an ILIT fits into your overall strategy and connect you with trusted legal partners and come up with a solid plan!",
      },
    ],
  }),

  post({
    slug: "key-to-tax-free-retirement-indexed-universal-life",
    title: "The Key to Tax-Free Retirement: Indexed Universal Life",
    excerpt:
      "Indexed Universal Life Insurance offers tax-free retirement income, long-term care coverage, and downside protection — all while guaranteeing a death benefit for your family.",
    author: "Chaz Goodin",
    publishedAt: "2025-02-24T00:00:00Z",
    insuranceLines: ["life"],
    status: "published",
    sourceUrl: "https://eliteinsuranceknoxville.com/elite-insurance-blog/indexeduniversallife",
    sections: [
      {
        type: "paragraph",
        text: "Planning for the future isn't just about saving—it's about maximizing your wealth while protecting your family and assets. Indexed Universal Life Insurance (IUL) is one of the most powerful financial tools available, offering tax-free retirement income, long-term care coverage, living benefits, and protection from market downturns—all while ensuring a guaranteed death benefit for your loved ones.",
      },
      {
        type: "paragraph",
        text: "Whether you're a self-employed individual looking to create a personal pension, a parent saving for your child's college, or a middle-aged professional securing long-term care, IUL provides a flexible, tax-advantaged solution tailored to your needs.",
      },
      { type: "heading", level: 2, text: "1. Tax-Free Retirement Income" },
      {
        type: "paragraph",
        text: "Most traditional retirement accounts—like 401(k)s and IRAs—come with a tax burden when you start withdrawing funds. With an IUL policy, you can access your cash value tax-free through policy loans or withdrawals, allowing you to supplement your retirement without giving a big chunk to the IRS.",
      },
      {
        type: "list",
        items: [
          "Tax-free income in retirement",
          "No contribution limits like traditional IRAs and 401(k)s and ROTH IRAs",
          "No required minimum distributions (RMDs)",
          "Access your funds before age 59 1/2",
          "Can be used as a buy-sell agreement for business owners with partners",
        ],
      },
      { type: "heading", level: 2, text: "2. Long-Term Care Benefits with Consistent Rates" },
      {
        type: "paragraph",
        text: "As you age, healthcare costs rise—and long-term care insurance premiums can be unpredictable. Our long-term care riders have consistent rates and allow you to tap into your death benefit if you need nursing home care, home health services, or assisted living, not just from a facility but also care from a family member.",
      },
      {
        type: "list",
        items: [
          "Predictable premium costs (unlike traditional long-term care insurance)",
          "Use your policy's benefits while you're still alive",
          "Avoid draining your retirement savings on medical expenses and specialized care",
        ],
      },
      { type: "heading", level: 2, text: "3. Living Benefits for Financial Flexibility" },
      {
        type: "paragraph",
        text: "Life is unpredictable, and an IUL policy can protect you while you're still living. Many policies include accelerated benefit riders that allow you to access part of your death benefit if you experience a critical, chronic, or terminal illness.",
      },
      {
        type: "list",
        items: [
          "Death Benefit can be accelerated for terminal, critical, and chronic illnesses",
          "Provides 100% of your death benefit should you become terminally ill and can be used for treatment that health insurance doesn't cover",
        ],
      },
      { type: "heading", level: 2, text: "4. Downside Protection with Uncapped Gains" },
      {
        type: "paragraph",
        text: "Unlike traditional investments that are tied to stock market volatility, IUL policies allow you to participate in market gains while protecting your money from losses.",
      },
      {
        type: "list",
        items: [
          "0.75% Floor — Your policy will never lose value due to market downturns",
          "Uncapped Growth — Our policies are uncapped on how much your cash value can grow, unlike some non-variable annuities and other IUL policies",
        ],
      },
      { type: "heading", level: 2, text: "5. Avoiding Probate & Keeping a Death Benefit" },
      {
        type: "paragraph",
        text: "One of the greatest advantages of IUL is that it avoids probate, ensuring your beneficiaries receive their inheritance quickly and tax-free.",
      },
      {
        type: "list",
        items: [
          "Your loved ones don't have to wait months (or years) for court proceedings",
          "Unlike term insurance, an IUL always includes a death benefit, no matter how much cash value you've used",
          "Loved ones do not have to quarrel over assets as life policies have assigned beneficiaries and can be structured to receive benefits over time and not all at once.",
        ],
      },
      { type: "heading", level: 2, text: "6. Using IUL for College Savings" },
      {
        type: "paragraph",
        text: "Looking for a better alternative to a 529 College Savings Plan and your loved one not quite old enough for a term policy? An IUL policy provides:",
      },
      {
        type: "list",
        items: [
          "Tax-free withdrawals for tuition, housing, or any expense",
          "No penalties if your child chooses a different career path",
          "No restrictions on how the funds are used",
        ],
      },
      {
        type: "paragraph",
        text: "With an IUL, you're not limited to just education-related expenses—you have total flexibility to use the funds however you see fit, whether for housing or tuition or other life opportunities.",
      },
      { type: "heading", level: 2, text: "7. Creating a Pension for Self-Employed Individuals & Families" },
      {
        type: "paragraph",
        text: "Self-employed individuals don't have the luxury of an employer-sponsored pension—but an IUL allows you to build your own.",
      },
      {
        type: "list",
        items: [
          "Tax-free withdrawals in retirement",
          "No annual contribution limits",
          "A guaranteed income stream for life",
        ],
      },
      {
        type: "paragraph",
        text: "Families can also use IUL policies as a generational wealth-building tool, ensuring financial stability for decades to come.",
      },
      { type: "heading", level: 2, text: "Is an IUL Policy Right for You?" },
      {
        type: "paragraph",
        text: "If you want a tax-free retirement income, long-term care protection, living benefits, and guaranteed security for your family, Indexed Universal Life Insurance is a smart choice.",
      },
      {
        type: "paragraph",
        text: "At Elite Insurance Group, we specialize in helping individuals, families, and business owners secure their financial future. Contact us today to explore how an IUL policy can fit into your long-term strategy!",
      },
    ],
  }),

  post({
    slug: "history-of-insurance",
    title: "The History of Insurance",
    excerpt:
      "From ancient risk-sharing practices to the highly specialized insurance products of today — a look at how insurance evolved into the industry we know now.",
    author: "Chaz Goodin",
    publishedAt: "2023-08-25T00:00:00Z",
    insuranceLines: ["other"],
    status: "published",
    sourceUrl: "https://eliteinsuranceknoxville.com/elite-insurance-blog/2023/8/25/the-history-of-insurance",
    sections: [
      {
        type: "paragraph",
        text: "Insurance, in its modern form, is a ubiquitous concept that provides individuals and businesses with financial protection against unforeseen events. From health and property to travel and business risks, insurance has become an integral part of our lives. However, the roots of insurance stretch far back in history, evolving over centuries into the complex industry we know today. Join us as we embark on a journey through time to explore the captivating history of insurance.",
      },
      { type: "heading", level: 2, text: "Ancient Beginnings" },
      {
        type: "paragraph",
        text: "The origins of insurance can be traced back to ancient civilizations, where communities came together to support each other in times of crisis. Early examples include the Code of Hammurabi, one of the oldest legal codes, which contained provisions for traders to pay extra to safeguard their goods against shipping losses. In ancient China, merchants spread their cargo across multiple ships to minimize the impact of losses due to shipwrecks or piracy. These practices laid the foundation for the principles of risk-sharing and risk management that underpin modern insurance.",
      },
      { type: "heading", level: 2, text: "Guilds and Mutual Aid" },
      {
        type: "paragraph",
        text: "During the Middle Ages, as trade and commerce flourished, guilds and mutual aid societies emerged as precursors to modern insurance institutions. Craft guilds, which brought together artisans of the same trade, provided members with financial assistance in case of accidents, illness, or death. These early forms of mutual aid exhibited the essence of insurance: pooling resources to mitigate individual risks.",
      },
      { type: "heading", level: 2, text: "Birth of Modern Insurance" },
      {
        type: "paragraph",
        text: "The evolution of insurance gained momentum in the 17th century. In 1666, after the Great Fire of London, Nicholas Barbon established one of the first property insurance companies to offer fire insurance. This marked a significant shift from informal risk-sharing arrangements to more structured, contract-based insurance policies.",
      },
      {
        type: "paragraph",
        text: "Marine insurance also took shape during this period. Lloyds of London, founded in the late 17th century as a coffeehouse for sailors, evolved into a prominent insurance market. It facilitated agreements between ship owners, merchants, and insurers, solidifying the concept of underwriting and spreading risk across multiple parties.",
      },
      { type: "heading", level: 2, text: "Industrial Revolution and Beyond" },
      {
        type: "paragraph",
        text: "The Industrial Revolution of the 18th and 19th centuries ushered in new risks and opportunities. As factories and transportation networks grew, the demand for insurance expanded. Life insurance gained popularity during this time, as people sought to protect their families in the event of untimely death.",
      },
      {
        type: "paragraph",
        text: "In the mid-19th century, the introduction of actuarial science revolutionized the insurance industry. Mathematicians and statisticians began to analyze data to calculate premiums more accurately, making insurance more sustainable and accessible.",
      },
      { type: "heading", level: 2, text: "20th Century and Beyond" },
      {
        type: "paragraph",
        text: "The 20th century brought further innovation to the insurance landscape. Automobile insurance became a necessity as cars became commonplace. The establishment of social insurance programs, such as Social Security, introduced government-backed safety nets for citizens. Health insurance also evolved, adapting to the changing needs of individuals and the rising costs of medical care.",
      },
      {
        type: "paragraph",
        text: "Globalization and technological advancements in the late 20th century paved the way for the modern insurance industry. The digital age transformed how insurance policies are sold, managed, and claimed. Online platforms streamlined processes, and data analytics enabled insurers to better assess risk and tailor coverage to individual needs.",
      },
      {
        type: "paragraph",
        text: "The history of insurance is a testament to humanity's ability to adapt and innovate in the face of uncertainty. From ancient civilizations' risk-sharing practices to the highly specialized insurance products of today, the journey has been marked by resilience, creativity, and a commitment to safeguarding against unforeseen events. As we continue to navigate the complexities of the modern world, the history of insurance serves as a reminder of our collective efforts to protect and support one another.",
      },
    ],
  }),

  post({
    slug: "guide-to-lower-insurance-rates",
    title: "A Guide to Lower Insurance Rates",
    excerpt:
      "Seven effective, proactive steps to help keep your insurance premiums affordable without compromising on coverage.",
    author: "Tyler Vaught",
    publishedAt: "2023-05-19T00:00:00Z",
    insuranceLines: ["auto", "home"],
    status: "published",
    sourceUrl: "https://eliteinsuranceknoxville.com/elite-insurance-blog/2023/5/19/guide-to",
    sections: [
      {
        type: "paragraph",
        text: "Insurance is an essential aspect of financial planning, but it can be a burden if the premiums are sky-high. However, there are proactive measures you can take to keep your insurance rates low while ensuring adequate coverage. In this blog post, we will explore seven effective tips to help you maintain affordable insurance rates without compromising on protection.",
      },
      {
        type: "list",
        items: [
          "Find an Independent Agent: One of the most crucial steps to secure low insurance rates is to shop around and compare quotes from multiple insurance providers. Different insurance companies offer varying rates based on factors such as your location, age, driving record, and credit history. An independent agent allows you to maintain quotes from several reputable companies and compare their offerings to find the most competitive rates.",
          "Bundle Your Policies: Insurance companies often provide significant discounts when you bundle multiple policies, such as home and auto insurance. Combining your policies with one insurer not only simplifies your coverage but also enables you to enjoy substantial savings. Check with your current insurer or explore options with other companies to determine the best bundle deals available.",
          "Maintain a Good Credit Score: Believe it or not, your credit score can impact your insurance rates. Insurers use credit-based insurance scores to assess the likelihood of a policyholder filing a claim. By maintaining a good credit score through responsible financial practices, such as paying bills on time and keeping credit card balances low, you can improve your insurance score and potentially qualify for lower rates.",
          "Increase Deductibles: A deductible is the amount you pay out of pocket before your insurance coverage kicks in. By opting for higher deductibles, you can significantly lower your premiums. However, it's crucial to ensure that you have sufficient funds available to cover the deductible in the event of a claim. Evaluate your financial situation and determine the highest deductible you can comfortably afford.",
          "Practice Safe Living and Driving Habits: Insurance rates are often influenced by risk factors, such as your lifestyle and driving habits. Maintain a safe living environment by installing security systems, smoke detectors, and fire extinguishers in your home. Implementing defensive driving techniques, avoiding traffic violations, and attending defensive driving courses can also contribute to lower auto insurance rates. By minimizing risks, you present yourself as a responsible and low-risk policyholder.",
          "Regularly Review and Update Your Coverage: Periodically reviewing your insurance coverage is essential to ensure that you're not paying for unnecessary or redundant coverage. As your circumstances change, such as paying off a mortgage or selling a vehicle, you may be eligible for lower premiums. Contact your insurance provider at least once a year to discuss any changes in your life that could affect your coverage and rates.",
          "Maintain a Claim-Free Record: Maintaining a claim-free record is crucial to keep your insurance rates low. Making frequent claims can label you as a high-risk policyholder, leading to higher premiums. Whenever possible, handle minor repairs and incidents out of pocket to avoid filing claims. Save your insurance for significant losses and emergencies.",
        ],
      },
      {
        type: "paragraph",
        text: "By following these seven effective tips, you can keep your insurance rates low while ensuring the protection you need. Remember to regularly shop around, bundle policies, maintain a good credit score, increase deductibles sensibly, practice safe habits, review your coverage, and strive to maintain a claim-free record. With a proactive approach and awareness of your insurance needs, you can strike the right balance between affordability and adequate coverage.",
      },
    ],
  }),

  post({
    slug: "tips-to-a-financially-stress-free-life",
    title: "Tips to a Financially Stress-Free Life",
    excerpt:
      "Managing personal finances doesn't have to be stressful. Practical steps for budgeting, saving, debt payoff, and reviewing your insurance coverage.",
    author: "Tyler Vaught",
    publishedAt: "2023-04-21T00:00:00Z",
    insuranceLines: ["other"],
    status: "published",
    sourceUrl:
      "https://eliteinsuranceknoxville.com/elite-insurance-blog/2023/4/21/tips-to-a-financially-stress-free-life",
    sections: [
      {
        type: "paragraph",
        text: "Managing personal finances can be stressful, but it doesn't have to be. Here are some tips to help you manage your finances stress-free.",
      },
      { type: "heading", level: 3, text: "1. Create a Budget" },
      {
        type: "paragraph",
        text: "Creating a budget is the first step to managing your personal finances. Start by listing all of your sources of income and your expenses. Categorize your expenses and allocate a specific amount of money for each category. Make sure to include your savings and emergency fund contributions in your budget. A budget will help you to stay on track and avoid overspending.",
      },
      { type: "heading", level: 3, text: "2. Track Your Expenses" },
      {
        type: "paragraph",
        text: "Tracking your expenses is crucial to managing your personal finances. Keep track of your spending by reviewing your bank and credit card statements regularly. This will help you to identify areas where you may be overspending and make adjustments to your budget as needed.",
      },
      { type: "heading", level: 3, text: "3. Automate Your Savings" },
      {
        type: "paragraph",
        text: "Automating your savings can help you to save more money without having to think about it. Set up automatic transfers from your checking account to your savings account on a regular basis. This will help you to build your emergency fund and achieve your savings goals more quickly.",
      },
      { type: "heading", level: 3, text: "4. Pay Off Your Debts" },
      {
        type: "paragraph",
        text: "Paying off your debts is essential to managing your personal finances. Start by paying off your high-interest debts first, such as credit card balances. Consider consolidating your debts to a lower interest rate to reduce your monthly payments and save on interest charges.",
      },
      { type: "heading", level: 3, text: "5. Invest for Your Future" },
      {
        type: "paragraph",
        text: "Investing for your future is an important part of managing your personal finances. Start by contributing to your employer-sponsored retirement plan, such as a 401(k) or 403(b). If your employer does not offer a retirement plan, consider opening an individual retirement account (IRA) or a brokerage account.",
      },
      { type: "heading", level: 3, text: "6. Review Your Insurance Policies" },
      {
        type: "paragraph",
        text: "Reviewing your insurance policies is another important aspect of managing your personal finances. Make sure you have adequate insurance coverage for your home, car, and health. Elite Insurance Knoxville will make sure you have adequate coverage while maintaining the best rates. Feel like your insurance is too expensive? Ask us for a requote or allow us to advise you in removing any unnecessary coverages!",
      },
      { type: "heading", level: 3, text: "7. Seek Professional Advice" },
      {
        type: "paragraph",
        text: "If you're struggling to manage your personal finances, seek professional advice. Consider working with a financial planner or a certified financial advisor who can help you develop a personalized financial plan based on your unique needs and goals.",
      },
      {
        type: "paragraph",
        text: "In conclusion, managing your personal finances can be stress-free if you follow these tips. Remember to create a budget, track your expenses, automate your savings, pay off your debts, invest for your future, review your insurance policies, and seek professional advice when needed. With these steps in place, you can achieve financial stability and enjoy a more fulfilling life.",
      },
    ],
  }),

  post({
    slug: "what-is-special-about-collector-car-insurance",
    title: "What is Special About Collector Car Insurance?",
    excerpt:
      "Collector car insurance differs from standard auto policies in coverage value, usage restrictions, and the extras that come with it. Here's what to know before you shop.",
    author: "Tyler Vaught",
    publishedAt: "2023-04-18T00:00:00Z",
    insuranceLines: ["collector-vehicle"],
    status: "published",
    sourceUrl:
      "https://eliteinsuranceknoxville.com/elite-insurance-blog/2023/4/18/what-is-special-about-collector-car-insurance",
    sections: [
      {
        type: "paragraph",
        text: "Collector car insurance is a type of insurance designed to protect classic, vintage, or collectible vehicles. These types of cars are not only valuable to their owners but often have sentimental value as well. As a result, collector car insurance policies differ from standard auto insurance policies in several ways.",
      },
      {
        type: "paragraph",
        text: "First, collector car insurance policies often provide coverage for the full value of the vehicle. Unlike traditional auto insurance policies, which only cover the actual cash value of the vehicle, collector car insurance policies provide coverage for the agreed-upon value of the car. This distinction matters because vintage automobiles frequently appreciate, meaning the agreed-upon value at purchase might fall short of the actual value when a claim arises.",
      },
      {
        type: "paragraph",
        text: "Second, collector car insurance policies often offer additional coverage options that are not available with traditional auto insurance policies. For example, many such policies include coverage for spare parts, automobilia, and other collectibles related to the vehicle. They also often offer roadside assistance and towing services, which can be crucial for classic cars that may break down on the road.",
      },
      {
        type: "paragraph",
        text: "Third, collector car insurance policies may have different usage restrictions than standard auto insurance policies. For example, they may limit the number of miles the vehicle can be driven each year, and may require that the car be stored in a secure, climate-controlled garage when not in use. These restrictions are in place to protect the value of the car and ensure that it is not subject to unnecessary wear and tear.",
      },
      {
        type: "paragraph",
        text: "Finally, collector car insurance policies often come with additional benefits, such as discounts on parts and services from certain providers, access to exclusive events and shows, and even free subscriptions to classic car magazines.",
      },
      {
        type: "paragraph",
        text: "When shopping for collector car insurance, it's important to do your research and choose a policy that meets your specific needs. Consider factors such as the value of your car, how often you plan to drive it, and where it will be stored. You may also want to consider working with an insurance broker who specializes in collector car insurance, as they can help you find the best policy for your needs and budget.",
      },
      {
        type: "paragraph",
        text: "In conclusion, collector car insurance is an essential type of insurance for anyone who owns a classic, vintage, or collectible vehicle. With its unique coverage options, usage restrictions, and additional benefits, collector car insurance can help you protect your investment and ensure that your beloved car is well taken care of for years to come.",
      },
    ],
  }),
];

// ---------------------------------------------------------------------------
// New posts — high-ROI lines, status: draft pending compliance review
// ---------------------------------------------------------------------------

const newPosts = [
  post({
    slug: "general-liability-insurance-101",
    title: "General Liability Insurance 101: What Every Small Business Owner Should Know",
    excerpt:
      "A slip-and-fall claim, a piece of damaged customer property, an advertising dispute — general liability is the coverage behind the claims that come with just doing business.",
    author: "Elite Insurance Group",
    publishedAt: new Date().toISOString(),
    insuranceLines: ["general-liability", "business"],
    status: "draft",
    sections: [
      {
        type: "paragraph",
        text: "General liability insurance is often the first policy a new business owner buys — and for good reason. It's the coverage that responds when your business is blamed for injuring someone or damaging their property, and it's frequently a requirement before you can sign a lease, land a contract, or bid on commercial work.",
      },
      { type: "heading", level: 2, text: "What General Liability Insurance Actually Covers" },
      {
        type: "list",
        items: [
          "Bodily injury claims from customers, clients, or visitors on your property",
          "Property damage you or your business cause to someone else's property",
          "Personal and advertising injury, such as libel, slander, or a copyright dispute tied to your marketing",
          "Legal defense costs, even when a claim against you is ultimately found to be without merit",
        ],
      },
      { type: "heading", level: 2, text: "Who Needs It" },
      {
        type: "paragraph",
        text: "Virtually any business that interacts with the public or works on other people's property has exposure here — retail shops, restaurants, contractors on a job site, and professional offices alike. Many commercial leases and client contracts specify a minimum liability limit before you're allowed to operate or bid, so this is often less optional than it looks.",
      },
      { type: "heading", level: 2, text: "What It Doesn't Cover" },
      {
        type: "paragraph",
        text: "General liability has real boundaries. It doesn't cover professional mistakes or advice (that's errors & omissions coverage), employee injuries (that's workers' compensation), or damage to your own business property or vehicles (that's commercial property and commercial auto, respectively). Intentional acts are excluded across the board.",
      },
      { type: "heading", level: 2, text: "How Much Coverage Do You Need?" },
      {
        type: "paragraph",
        text: "The right limit depends on your industry's risk profile and what your contracts or lease require. For a lot of small businesses, general liability is bundled with commercial property coverage into a Business Owner's Policy (BOP), which combines both under one policy rather than buying them separately.",
      },
      {
        type: "paragraph",
        text: "Every business's risk profile is different, and the right limits and endorsements depend on the specifics of what you do. If you're not sure where your current coverage stands, Elite Insurance Group works with multiple carriers and can walk through your policy with you.",
      },
    ],
  }),

  post({
    slug: "commercial-auto-insurance-for-contractors-and-fleets",
    title: "Commercial Auto Insurance for Contractors and Delivery Fleets",
    excerpt:
      "Personal auto policies almost always exclude business use. If you drive for work, here's what a commercial auto policy actually covers — and when you need one.",
    author: "Elite Insurance Group",
    publishedAt: new Date().toISOString(),
    insuranceLines: ["commercial-auto", "contractors", "business"],
    status: "draft",
    sections: [
      {
        type: "paragraph",
        text: "Personal auto insurance is written around personal use. If you drive a vehicle for work — hauling materials, making deliveries, transporting employees or equipment — and you're in an accident, a personal auto claim can be denied outright once the insurer determines the vehicle was being used for business.",
      },
      { type: "heading", level: 2, text: "When You Need a Commercial Auto Policy" },
      {
        type: "list",
        items: [
          "The vehicle is titled to the business, not an individual",
          "It's used to haul tools, equipment, or materials",
          "It's used for deliveries or client visits",
          "It's driven by employees other than the owner",
          "It carries magnetic signage or branding — many personal insurers treat this alone as commercial use",
        ],
      },
      { type: "heading", level: 2, text: "What It Covers" },
      {
        type: "list",
        items: [
          "Liability for injuries or property damage you cause while driving for work",
          "Physical damage to your own vehicle (collision and comprehensive)",
          "Hired and non-owned auto coverage, for rented vehicles or an employee's personal car used for work",
          "Medical payments for you and your passengers",
        ],
      },
      { type: "heading", level: 2, text: "Building a Fleet Policy as You Grow" },
      {
        type: "paragraph",
        text: "As a contracting or delivery business adds trucks, trailers, or specialty equipment, a single commercial auto policy can typically add each vehicle as a scheduled item rather than requiring a separate policy for each one. Coverage is generally structured around how the vehicles are actually used — local routes versus long-haul, driver records, and vehicle type all factor in.",
      },
      {
        type: "paragraph",
        text: "If you're currently running work vehicles on a personal policy, or you're not sure whether your current commercial policy covers everyone who drives for you, it's worth a review before a claim forces the question.",
      },
    ],
  }),

  post({
    slug: "boat-insurance-east-tennessee-lakes",
    title: "Boat Insurance for East Tennessee Lake Owners: What Norris, Cherokee, and Tellico Boaters Should Know",
    excerpt:
      "Homeowners insurance typically offers little to no coverage for a boat once it's on the water. Here's what a dedicated boat policy actually covers.",
    author: "Elite Insurance Group",
    publishedAt: new Date().toISOString(),
    insuranceLines: ["boat"],
    status: "draft",
    sections: [
      {
        type: "paragraph",
        text: "East Tennessee's TVA lakes — Norris, Cherokee, Tellico, Fort Loudoun, and Watts Bar — make boat ownership part of everyday life for a lot of families in this area. What catches a lot of owners off guard is that homeowners insurance typically provides little to no coverage for a boat once it leaves the dock, and many homeowners policies cap watercraft coverage at a low dollar amount regardless of what the boat is actually worth.",
      },
      { type: "heading", level: 2, text: "What a Dedicated Boat Policy Covers" },
      {
        type: "list",
        items: [
          "Physical damage to the hull, motor, and trailer",
          "Liability if your boat injures someone or damages another vessel or a dock",
          "Medical payments for injuries aboard your boat",
          "Uninsured/underinsured boater coverage",
          "Towing and on-water assistance",
        ],
      },
      { type: "heading", level: 2, text: "Factors That Affect Boat Coverage" },
      {
        type: "paragraph",
        text: "The type of boat — pontoon, ski/wake, bass boat, personal watercraft — along with horsepower, age, value, where it's stored or moored, and how it's used all factor into how a policy should be structured. A boat kept on a lift at a Cherokee Lake dock has a different risk profile than one trailered to Tellico most weekends.",
      },
      { type: "heading", level: 2, text: "Personal Watercraft and Trailers" },
      {
        type: "paragraph",
        text: "Personal watercraft (jet skis) often need to be scheduled separately from a primary boat policy, and it's worth confirming whether your trailer is covered under the boat policy or your auto policy — a detail that's easy to miss and easy to get wrong.",
      },
      {
        type: "paragraph",
        text: "If boating season is coming up and you're not sure what your current policy actually covers on the water, it's worth a quick review before you launch.",
      },
    ],
  }),

  post({
    slug: "group-life-insurance-employee-benefit",
    title: "Group Life Insurance as an Employee Benefit: Why Small Businesses Are Adding It",
    excerpt:
      "As the labor market has tightened, more small and mid-sized businesses are adding group life insurance — a low-cost benefit that also protects employees' families.",
    author: "Elite Insurance Group",
    publishedAt: new Date().toISOString(),
    insuranceLines: ["group-life", "business"],
    status: "draft",
    sections: [
      {
        type: "paragraph",
        text: "Alongside health insurance, more small and mid-sized businesses have been adding group life insurance to their benefits package — both as a hiring tool in a competitive labor market and as a genuinely low-cost way to support employees' families.",
      },
      { type: "heading", level: 2, text: "How Group Life Works" },
      {
        type: "paragraph",
        text: "An employer purchases a policy covering all, or a defined class of, employees — typically at a flat benefit amount or a multiple of salary. Because the risk is spread across the group rather than underwritten individually, premiums are generally lower per employee than a comparable individual policy, and many group plans don't require a medical exam for base coverage amounts.",
      },
      { type: "heading", level: 2, text: "What It Typically Includes" },
      {
        type: "list",
        items: [
          "A base death benefit paid to the employee's designated beneficiary",
          "The option for employees to purchase supplemental coverage above the base amount",
          "Portability options in some plans if an employee leaves the company",
          "Accidental death & dismemberment (AD&D) riders in many plans",
        ],
      },
      { type: "heading", level: 2, text: "Why Businesses Are Adding It Now" },
      {
        type: "paragraph",
        text: "Relative to its perceived value to employees, group life is one of the more affordable benefits to add, and it typically layers in alongside an existing group health plan without much added administrative overhead.",
      },
      { type: "heading", level: 2, text: "A Note on Individual Coverage" },
      {
        type: "paragraph",
        text: "Group life usually isn't a full replacement for an employee's individual life insurance needs — coverage is often tied to employment and may not follow the employee if they leave the company. Business owners weighing group life for their team should also think separately about whether they personally need supplemental individual coverage, or business-focused coverage like key person insurance or a buy-sell funding policy. That's worth its own conversation rather than assuming a group plan already handles it.",
      },
    ],
  }),

  post({
    slug: "workers-compensation-tennessee-employer-guide",
    title: "Workers' Compensation Insurance: A Tennessee Employer's Guide",
    excerpt:
      "Tennessee's coverage threshold is stricter for construction than for most other industries. Here's what employers need to know about who's required to carry it and what it pays for.",
    author: "Elite Insurance Group",
    publishedAt: new Date().toISOString(),
    insuranceLines: ["workers-comp", "business", "contractors"],
    status: "draft",
    sections: [
      {
        type: "paragraph",
        text: "Under Tennessee law, most employers with five or more full- or part-time employees are required to carry workers' compensation insurance. Construction service providers face a stricter rule: coverage is required starting with the very first employee, with no five-employee grace period. Even where it isn't strictly required, workers' comp is one of the more consequential coverages a business can go without — a single serious workplace injury can otherwise become a direct financial liability to the business itself.",
      },
      { type: "heading", level: 2, text: "What Workers' Comp Covers" },
      {
        type: "list",
        items: [
          "Medical expenses related to a workplace injury or illness",
          "A portion of lost wages during recovery",
          "Disability benefits for injuries causing lasting impairment",
          "Death benefits for an employee's dependents in the event of a fatal workplace accident",
          "Legal costs if an injured employee's claim leads to litigation",
        ],
      },
      { type: "heading", level: 2, text: "Why It Matters Beyond the Legal Requirement" },
      {
        type: "paragraph",
        text: "Workers' comp is generally the exclusive remedy for a workplace injury — meaning that in most cases, an injured employee covered by the policy can't also sue their employer directly for damages the policy already covers. That's a protection that runs in both directions, for the employee and the business.",
      },
      { type: "heading", level: 2, text: "Getting Coverage Right" },
      {
        type: "paragraph",
        text: "Premiums are typically driven by total payroll, industry classification codes, and claims history. Accurately classifying what employees actually do — office staff versus field or labor roles, for example — matters for both cost and making sure a claim is actually covered the way you expect.",
      },
      {
        type: "paragraph",
        text: "If you're not sure whether your current classifications match what your team actually does day to day, that's worth reviewing before it becomes a claims issue.",
      },
    ],
  }),

  post({
    slug: "builders-risk-insurance-for-contractors-and-developers",
    title: "Builders Risk Insurance: What Contractors and Developers Need During a Project",
    excerpt:
      "A standard commercial property policy is written for a completed, occupied building — not one mid-construction. Builders risk insurance is built to close that gap.",
    author: "Elite Insurance Group",
    publishedAt: new Date().toISOString(),
    insuranceLines: ["builders-risk", "contractors"],
    status: "draft",
    sections: [
      {
        type: "paragraph",
        text: "A standard commercial property policy is written to cover a completed, occupied building — not one that's mid-construction, sitting with exposed framing, stored materials, and a risk profile that changes week to week. That gap is what builders risk insurance is built to close.",
      },
      { type: "heading", level: 2, text: "What Builders Risk Covers" },
      {
        type: "list",
        items: [
          "The structure itself while under construction, renovation, or repair",
          "Materials and equipment on-site, or in some policies, in transit to the site",
          "Damage from causes like fire, wind, theft, and vandalism — specific causes of loss vary by policy",
          "In some cases, soft costs like lost financing or lease income caused by a construction delay",
        ],
      },
      { type: "heading", level: 2, text: "Who Typically Needs the Policy" },
      {
        type: "paragraph",
        text: "General contractors, developers, and property owners overseeing new construction or a major renovation project are the typical policyholders. Lenders financing a project frequently require proof of builders risk coverage before releasing funds, which makes this less optional than it might otherwise seem.",
      },
      { type: "heading", level: 2, text: "How Long Coverage Lasts" },
      {
        type: "paragraph",
        text: "Builders risk is a project-specific term, not an annual policy. It typically runs from the start of construction until the building is completed, occupied, or the property's ownership and permanent insurance take over — whichever comes first.",
      },
      { type: "heading", level: 2, text: "Coordinating with Other Coverage" },
      {
        type: "paragraph",
        text: "Builders risk is meant to work alongside a contractor's general liability and commercial auto coverage, not replace either one. Liability for injuries on the job site or in transit is typically handled under those separate policies, so builders risk and GL should be reviewed together, not treated as interchangeable.",
      },
    ],
  }),
];

const documents = [...migratedPosts, ...newPosts];

for (const doc of documents) {
  await client.createOrReplace(doc);
  console.log(`Upserted ${doc.status.padEnd(9)} ${doc._id}`);
}

console.log(`\nDone. ${migratedPosts.length} migrated (published), ${newPosts.length} new (draft).`);
