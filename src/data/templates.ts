import { PromptTemplate } from '../types';

export const DEFAULT_TEMPLATES: PromptTemplate[] = [
  // Writing
  {
    id: 'tpl-blog-post',
    title: 'Blog Post Writer',
    content: `Write a comprehensive blog post about [topic].

Target audience: [audience]
Tone: [tone] (e.g., professional, casual, authoritative)
Length: approximately [word_count] words

Structure:
- Engaging introduction with a hook
- [number] main sections with H2 headings
- Actionable takeaways in each section
- Strong conclusion with call-to-action

Include:
- Relevant examples or case studies
- Data points or statistics where appropriate
- Practical tips readers can implement immediately

SEO considerations:
- Primary keyword: [keyword]
- Include related keywords naturally
- Write a meta description under 160 characters`,
    category: 'Writing',
    tags: ['blog', 'content', 'seo'],
    description: 'Generate a structured, SEO-friendly blog post on any topic with proper headings and actionable content.',
  },
  {
    id: 'tpl-story-generator',
    title: 'Story Generator',
    content: `Write a short story with the following elements:

Genre: [genre] (e.g., sci-fi, fantasy, thriller, romance)
Setting: [setting]
Main character: [character_description]
Conflict: [conflict]
Theme: [theme]

Requirements:
- Opening that immediately hooks the reader
- Show, don't tell — use sensory details
- Dialogue that reveals character
- A turning point that shifts the story
- Satisfying resolution that ties back to the theme

Length: [word_count] words
Point of view: [pov] (first person / third person limited / omniscient)
Tone: [tone]`,
    category: 'Writing',
    tags: ['creative', 'fiction', 'storytelling'],
    description: 'Create a compelling short story with defined genre, characters, and narrative arc.',
  },
  {
    id: 'tpl-article-summarizer',
    title: 'Article Summarizer',
    content: `Summarize the following article/text:

[paste article here]

Provide:
1. **One-sentence summary** — the core message
2. **Key points** — 3-5 bullet points of main arguments
3. **Important data** — any statistics, dates, or facts mentioned
4. **Conclusion** — what the author concludes
5. **My assessment** — strengths and weaknesses of the argument

Format the summary for [audience] (e.g., executives, researchers, students).
Keep the total summary under [length] words.`,
    category: 'Writing',
    tags: ['summary', 'analysis', 'reading'],
    description: 'Condense any article into a structured summary with key points, data, and critical assessment.',
  },

  // Development
  {
    id: 'tpl-code-explainer',
    title: 'Code Explainer',
    content: `Explain the following code in detail:

\`\`\`
[paste code here]
\`\`\`

Provide:
1. **Overview** — What does this code do in one sentence?
2. **Line-by-line breakdown** — Walk through each significant line
3. **Data flow** — How does data move through this code?
4. **Edge cases** — What inputs could cause issues?
5. **Improvements** — Suggest any optimizations or better practices
6. **Related concepts** — What programming concepts are used here?

Assume the reader has [level] experience (beginner/intermediate/advanced).
Use [language] for explanations if the code is in a different language.`,
    category: 'Development',
    tags: ['code', 'explanation', 'learning'],
    description: 'Get a detailed walkthrough of any code snippet with line-by-line explanation and improvement suggestions.',
  },
  {
    id: 'tpl-bug-investigator',
    title: 'Bug Investigator',
    content: `Help me debug the following issue:

**Expected behavior:** [what should happen]
**Actual behavior:** [what actually happens]
**Error message:** [paste error if any]
**Steps to reproduce:**
1. [step 1]
2. [step 2]
3. [step 3]

**Environment:**
- Language/Framework: [tech stack]
- Version: [version]
- OS: [operating system]

**Code context:**
\`\`\`
[paste relevant code]
\`\`\`

Please:
1. Identify the most likely root cause
2. Explain why this error occurs
3. Provide a fix with code
4. Suggest how to prevent this in the future
5. Check for related issues that might surface later`,
    category: 'Development',
    tags: ['debugging', 'error', 'troubleshooting'],
    description: 'Systematically diagnose and fix bugs with structured analysis and prevention strategies.',
  },
  {
    id: 'tpl-api-docs',
    title: 'API Documentation',
    content: `Generate API documentation for the following endpoint:

**Endpoint:** [method] [url]
**Purpose:** [what it does]

**Request:**
\`\`\`
[paste request example or describe parameters]
\`\`\`

**Response:**
\`\`\`
[paste response example]
\`\`\`

Include:
1. **Description** — What this endpoint does
2. **Parameters** — All query, path, and body parameters with types
3. **Response schema** — JSON structure with field descriptions
4. **Status codes** — All possible responses (200, 400, 401, 404, 500)
5. **Example request** — cURL or SDK code
6. **Example response** — Full JSON response
7. **Rate limits** — If applicable
8. **Authentication** — Required auth method

Format for [docs_format] (OpenAPI/Swagger, Markdown, or developer portal).`,
    category: 'Development',
    tags: ['api', 'documentation', 'rest'],
    description: 'Generate complete API documentation with parameters, response schema, examples, and status codes.',
  },

  // Business
  {
    id: 'tpl-meeting-agenda',
    title: 'Meeting Agenda',
    content: `Create a meeting agenda for:

**Meeting type:** [type] (standup, planning, review, brainstorm, decision)
**Duration:** [duration] minutes
**Attendees:** [list of roles/people]
**Objective:** [what we need to accomplish]

**Background context:**
[paste relevant context, previous decisions, or blockers]

Generate:
1. **Pre-meeting prep** — What attendees should prepare
2. **Time-boxed agenda** — Each item with allocated time
3. **Discussion questions** — Specific questions for each topic
4. **Decision points** — What needs to be decided
5. **Action items template** — For capturing follow-ups
6. **Parking lot** — Space for off-topic items

Include buffer time between items and a 5-minute wrap-up slot.`,
    category: 'Business',
    tags: ['meeting', 'planning', 'productivity'],
    description: 'Structure any meeting with time-boxed agenda items, discussion questions, and action item tracking.',
  },
  {
    id: 'tpl-project-proposal',
    title: 'Project Proposal',
    content: `Write a project proposal for:

**Project name:** [name]
**Client/Stakeholder:** [who]
**Timeline:** [duration]
**Budget range:** [budget]

**Problem statement:**
[describe the problem or opportunity]

**Proposed solution:**
[brief description of your approach]

Generate a proposal with:
1. **Executive Summary** — 2-3 paragraph overview
2. **Problem Analysis** — Why this matters, current pain points
3. **Proposed Solution** — Detailed approach with phases
4. **Timeline** — Milestones with dates
5. **Resource Requirements** — Team, tools, budget breakdown
6. **Risk Assessment** — Potential risks and mitigation strategies
7. **Success Metrics** — How we'll measure success
8. **Next Steps** — Immediate actions after approval

Tone: [tone] (professional, persuasive, technical)
Format: [format] (formal document, slide deck outline, email pitch)`,
    category: 'Business',
    tags: ['proposal', 'planning', 'project'],
    description: 'Draft a comprehensive project proposal with timeline, budget, risk assessment, and success metrics.',
  },
  {
    id: 'tpl-performance-review',
    title: 'Performance Review',
    content: `Help me write a performance review for:

**Employee name:** [name]
**Role:** [position]
**Review period:** [dates]
**Review type:** [self/peer/manager]

**Key achievements:**
1. [achievement 1]
2. [achievement 2]
3. [achievement 3]

**Areas for improvement:**
1. [area 1]
2. [area 2]

**Goals for next period:**
[describe goals]

Generate:
1. **Overall assessment** — Summary paragraph
2. **Strengths** — Specific examples of excellent performance
3. **Development areas** — Constructive feedback with examples
4. **Goal recommendations** — SMART goals for next period
5. **Competency ratings** — Rate key competencies (1-5 scale)
6. **Manager comments** — Professional, balanced tone

Tone: constructive, specific, actionable. Avoid vague praise.`,
    category: 'Business',
    tags: ['hr', 'review', 'feedback'],
    description: 'Write balanced, specific performance reviews with concrete examples and actionable development goals.',
  },

  // Marketing
  {
    id: 'tpl-social-media',
    title: 'Social Media Post',
    content: `Create a social media post for:

**Platform:** [platform] (Twitter/X, LinkedIn, Instagram, Facebook)
**Topic:** [topic]
**Goal:** [goal] (engagement, traffic, leads, brand awareness)
**Brand voice:** [voice] (professional, witty, inspirational, educational)

**Key message:**
[one sentence you want to convey]

**Call to action:** [what should the reader do]

**Hashtags:** [number] relevant hashtags

**Image/visual suggestion:** [describe what image would complement this]

Requirements:
- Character count: under [limit] for [platform]
- Include emojis where appropriate
- Make it scannable (line breaks, bullet points)
- Start with a hook that stops the scroll
- End with a clear CTA`,
    category: 'Marketing',
    tags: ['social', 'content', 'copywriting'],
    description: 'Craft platform-optimized social media posts with hooks, CTAs, and relevant hashtags.',
  },
  {
    id: 'tpl-product-description',
    title: 'Product Description',
    content: `Write a product description for:

**Product name:** [name]
**Category:** [category]
**Target customer:** [who buys this]
**Key features:**
1. [feature 1]
2. [feature 2]
3. [feature 3]

**Price point:** [price]
**Competitors:** [list main competitors]

**Unique selling proposition:**
[what makes this different/better]

Generate:
1. **Headline** — Attention-grabbing, benefit-focused
2. **Opening hook** — Address the customer's pain point
3. **Feature-benefit pairs** — Each feature tied to a customer benefit
4. **Social proof element** — Suggest where to add reviews/stats
5. **Urgency/scarcity** — Ethical persuasion element
6. **CTA** — Clear next step

Tone: [tone]
Platform: [e-commerce site, Amazon, app store, landing page]`,
    category: 'Marketing',
    tags: ['product', 'ecommerce', 'copywriting'],
    description: 'Write compelling product descriptions that convert browsers into buyers with benefit-focused copy.',
  },
  {
    id: 'tpl-ad-copy',
    title: 'Ad Copy Generator',
    content: `Generate ad copy for:

**Product/Service:** [name]
**Platform:** [Google Ads, Facebook Ads, Instagram, LinkedIn]
**Campaign objective:** [awareness, traffic, conversions, leads]
**Target audience:** [detailed audience description]
**Budget:** [budget level — helps determine aggressiveness]

**Key selling points:**
1. [point 1]
2. [point 2]
3. [point 3]

**Landing page URL:** [url]

Generate:
1. **Headlines** (3 variations, under 30 chars each)
2. **Descriptions** (2 variations, under 90 chars each)
3. **Primary text** (for social ads, 125 chars)
4. **CTA suggestions** (3 options)
5. **Audience targeting** (interests, demographics)
6. **A/B test recommendations** — What to test first

Include emotional triggers and urgency where appropriate.`,
    category: 'Marketing',
    tags: ['advertising', 'copywriting', 'ppc'],
    description: 'Generate platform-specific ad copy with headlines, descriptions, and A/B testing recommendations.',
  },

  // Education
  {
    id: 'tpl-study-guide',
    title: 'Study Guide Creator',
    content: `Create a comprehensive study guide for:

**Subject:** [subject]
**Exam/Level:** [exam name or level]
**Timeline:** [how long until the exam]
**Current understanding:** [beginner/intermediate/advanced]

**Topics to cover:**
1. [topic 1]
2. [topic 2]
3. [topic 3]

Generate:
1. **Overview** — Key concepts summary
2. **Topic breakdown** — Each topic with:
   - Core concept explanation
   - Key formulas/facts/rules
   - Common mistakes to avoid
   - Practice questions (3 per topic)
3. **Study schedule** — Daily plan for [timeline]
4. **Memory aids** — Mnemonics, analogies, visual aids
5. **Practice test** — 10 mixed questions with answers
6. **Quick reference sheet** — One-page cheat sheet

Include difficulty ratings for each topic.`,
    category: 'Education',
    tags: ['study', 'exam', 'learning'],
    description: 'Build a structured study guide with topic breakdowns, practice questions, and a study schedule.',
  },
  {
    id: 'tpl-flashcards',
    title: 'Flashcard Generator',
    content: `Generate flashcards for:

**Subject:** [subject]
**Number of cards:** [number]
**Difficulty level:** [beginner/intermediate/advanced]

**Topics to cover:**
[list topics or paste material]

Create flashcards with:
1. **Front:** Question or concept prompt (concise, specific)
2. **Back:** Answer with brief explanation
3. **Hint:** Optional clue for difficult cards
4. **Tags:** Category tags for organization

Rules:
- One concept per card (atomic cards)
- Use clear, unambiguous language
- Include real-world examples where helpful
- Mix question types: definition, application, comparison, analysis
- Order from basic to advanced

Format as a numbered list that can be imported into flashcard apps (Anki, Quizlet).`,
    category: 'Education',
    tags: ['flashcards', 'memorization', 'review'],
    description: 'Create well-structured flashcards with atomic concepts, hints, and progressive difficulty.',
  },
  {
    id: 'tpl-concept-explainer',
    title: 'Concept Explainer',
    content: `Explain [concept] in a way that:

**Audience:** [who] (student, professional, curious beginner)
**Prior knowledge:** [what they already know]
**Goal:** [what they need to do with this knowledge]

**Specific questions:**
1. [question 1]
2. [question 2]
3. [question 3]

Include:
1. **Simple analogy** — Relate to something familiar
2. **Visual description** — Describe what this looks like
3. **How it works** — Step-by-step breakdown
4. **Why it matters** — Real-world applications
5. **Common misconceptions** — What people get wrong
6. **Deep dive** — For those who want more detail
7. **Practice** — How to apply this knowledge

Use the Feynman technique: explain it simply, identify gaps, go back and fill them.`,
    category: 'Education',
    tags: ['explanation', 'learning', 'concept'],
    description: 'Break down complex concepts using analogies, visuals, and the Feynman technique.',
  },

  // Creative
  {
    id: 'tpl-tagline-generator',
    title: 'Tagline Generator',
    content: `Generate taglines for:

**Brand/Product:** [name]
**Industry:** [industry]
**Target audience:** [who]
**Brand personality:** [personality traits]
**Key differentiator:** [what makes it unique]

**Existing taglines you like:**
[example taglines for reference]

**Taglines to avoid:**
[examples of what NOT to do]

Generate:
1. **10 tagline options** across different styles:
   - Benefit-focused (what you get)
   - Emotion-focused (how you feel)
   - Witty/humorous
   - Short and punchy (under 5 words)
   - Aspirational

2. **Top 3 recommendations** with reasoning
3. **Usage guidelines** — Where each works best
4. **Testing suggestions** — How to validate with your audience

Keep each tagline under [length] characters.`,
    category: 'Creative',
    tags: ['branding', 'marketing', 'copywriting'],
    description: 'Generate creative taglines across multiple styles with strategic recommendations.',
  },
  {
    id: 'tpl-name-generator',
    title: 'Name Generator',
    content: `Generate names for:

**What:** [product/company/app/feature]
**Industry:** [industry]
**Target audience:** [who]
**Style:** [style] (modern, classic, playful, professional, techy)
**Values:** [key brand values]

**Name requirements:**
- Length: [short/medium/any]
- Should convey: [qualities]
- Avoid: [things to avoid]
- Must be: [requirements — easy to spell, pronounce, etc.]

**Existing names you like:**
[examples for reference]

**Domain availability check:** (if applicable)
[list preferred TLDs]

Generate:
1. **20 name options** organized by style
2. **Top 5 recommendations** with:
   - Meaning/origin
   - Why it works
   - Potential concerns
3. **Variations** — Slight modifications of top picks
4. **Tagline pairings** — Short taglines that complement each name`,
    category: 'Creative',
    tags: ['naming', 'branding', 'creative'],
    description: 'Generate creative names for products, companies, or features with strategic analysis.',
  },

  // Productivity
  {
    id: 'tpl-weekly-plan',
    title: 'Weekly Planner',
    content: `Create a weekly plan for:

**Role:** [your role]
**Key priorities this week:**
1. [priority 1]
2. [priority 2]
3. [priority 3]

**Recurring commitments:**
[list regular meetings, deadlines, etc.]

**Energy levels:**
- Monday: [high/medium/low]
- Tuesday: [high/medium/low]
- Wednesday: [high/medium/low]
- Thursday: [high/medium/low]
- Friday: [high/medium/low]

**Personal commitments:**
[any non-negotiable personal items]

Generate:
1. **Time-blocked schedule** — Match high-energy tasks to high-energy days
2. **Daily priorities** — Top 3 must-dos each day
3. **Buffer time** — Built-in flexibility for unexpected tasks
4. **Review checkpoints** — Mid-week and end-of-week reviews
5. **Weekly reflection prompts** — Questions for end-of-week review
6. **Energy management tips** — When to take breaks`,
    category: 'Productivity',
    tags: ['planning', 'schedule', 'time-management'],
    description: 'Create an energy-aware weekly schedule with time blocks, priorities, and reflection checkpoints.',
  },
  {
    id: 'tpl-decision-matrix',
    title: 'Decision Matrix',
    content: `Help me make a decision about:

**Decision:** [what you need to decide]
**Options:**
1. [option 1]
2. [option 2]
3. [option 3]
4. [option 4]

**Criteria (rate each 1-10):**
- [criterion 1] (weight: [1-5])
- [criterion 2] (weight: [1-5])
- [criterion 3] (weight: [1-5])
- [criterion 4] (weight: [1-5])

**Context:**
[Any relevant constraints, timeline, or background]

Generate:
1. **Scored matrix** — Rate each option against each criterion
2. **Weighted results** — Calculate weighted scores
3. **Pros/cons** — For top 2 options
4. **Risk analysis** — What could go wrong with each
5. **Recommendation** — Based on the analysis
6. **Decision deadline** — Suggested timeframe to decide
7. **Reversibility check** — How hard is it to change course later?`,
    category: 'Productivity',
    tags: ['decision', 'analysis', 'planning'],
    description: 'Make complex decisions with a weighted scoring matrix, risk analysis, and clear recommendation.',
  },
  {
    id: 'tpl-goal-setting',
    title: 'Goal Setting Framework',
    content: `Help me set goals for:

**Area:** [career/health/learning/finance/personal]
**Timeframe:** [3 months / 6 months / 1 year]
**Current situation:** [where I am now]
**Desired outcome:** [where I want to be]

**Past attempts:**
[what I've tried before and why it didn't work]

**Constraints:**
[time, money, energy, or other limitations]

Generate:
1. **SMART goal statement** — Specific, Measurable, Achievable, Relevant, Time-bound
2. **Milestone breakdown** — Monthly/weekly sub-goals
3. **Action steps** — Concrete daily/weekly habits
4. **Obstacle anticipation** — Likely challenges and solutions
5. **Tracking system** — How to measure progress
6. **Accountability structure** — Check-in points
7. **Reward system** — Milestone celebrations
8. **Contingency plan** — What to do if off-track`,
    category: 'Productivity',
    tags: ['goals', 'planning', 'motivation'],
    description: 'Set structured goals with SMART statements, milestones, tracking, and accountability systems.',
  },

  // Data
  {
    id: 'tpl-sql-query',
    title: 'SQL Query Builder',
    content: `Help me write a SQL query for:

**Database:** [PostgreSQL/MySQL/SQLite/SQL Server]
**Table(s):** [table names and brief schema]
\`\`\`
[paste CREATE TABLE or describe structure]
\`\`\`

**What I need:**
[describe in plain English what you want to retrieve/modify]

**Filters:**
- [filter 1]
- [filter 2]

**Sorting:** [sort criteria]
**Grouping:** [group by criteria]

**Sample data:**
[paste a few rows if helpful]

Generate:
1. **The query** — Optimized and commented
2. **Explanation** — Line-by-line breakdown
3. **Performance notes** — Index suggestions if needed
4. **Alternative approaches** — Different ways to solve the same problem
5. **Edge cases** — What to watch out for
6. **Testing suggestions** — How to verify correctness`,
    category: 'Data',
    tags: ['sql', 'database', 'query'],
    description: 'Build optimized SQL queries with explanations, performance notes, and alternative approaches.',
  },
  {
    id: 'tpl-data-visualization',
    title: 'Data Visualization Guide',
    content: `Help me visualize this data:

**Data description:** [what the data represents]
**Data shape:** [table structure or paste sample]
\`\`\`
[paste data or describe columns]
\`\`\__

**Audience:** [who will see this]
**Goal:** [what insight should they gain]
**Medium:** [presentation, report, dashboard, web]

**Constraints:**
- Available tools: [Excel, Python, Tableau, etc.]
- Color requirements: [accessible, brand colors, etc.]
- Space: [how much room for the visualization]

Generate:
1. **Chart recommendation** — Best visualization type with reasoning
2. **Design specifications** — Axes, labels, colors, layout
3. **Data preparation** — Any transformations needed
4. **Code/template** — Implementation in [tool]
5. **Accessibility check** — Color blind friendly, alt text
6. **Narrative** — How to explain this visualization
7. **Alternatives** — Other valid visualization options`,
    category: 'Data',
    tags: ['visualization', 'charts', 'analysis'],
    description: 'Choose the right chart type and get implementation specs for effective data visualization.',
  },
  {
    id: 'tpl-report-generator',
    title: 'Report Generator',
    content: `Generate a report on:

**Topic:** [subject]
**Report type:** [executive summary, analysis, research, status update]
**Audience:** [executives, team, client, stakeholders]
**Length:** [number] pages or [word_count] words

**Data/inputs:**
[paste relevant data, metrics, or context]

**Key questions to answer:**
1. [question 1]
2. [question 2]
3. [question 3]

**Time period:** [week/month/quarter/year]
**Comparison period:** [what to compare against]

Generate:
1. **Executive summary** — Key findings in 3-4 sentences
2. **Detailed analysis** — Data-driven insights with charts
3. **Trends** — What's changing and why
4. **Recommendations** — Actionable next steps
5. **Risks/Concerns** — Issues that need attention
6. **Appendix** — Supporting data tables

Format: [formal report, slide deck, email summary]
Tone: [objective, persuasive, urgent]`,
    category: 'Data',
    tags: ['report', 'analysis', 'business'],
    description: 'Generate structured reports with executive summaries, data analysis, and actionable recommendations.',
  },
];
