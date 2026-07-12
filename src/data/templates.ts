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
    isSystem: true,
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
    isSystem: true,
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
    isSystem: true,
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
    isSystem: true,
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
    isSystem: true,
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
    isSystem: true,
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
    isSystem: true,
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
    isSystem: true,
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
    isSystem: true,
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
    isSystem: true,
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
    isSystem: true,
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
    isSystem: true,
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
    isSystem: true,
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
    isSystem: true,
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
    isSystem: true,
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
    isSystem: true,
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
    isSystem: true,
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
    isSystem: true,
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
    isSystem: true,
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
    isSystem: true,
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
    isSystem: true,
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
    isSystem: true,
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
    isSystem: true,
  },

  // Translation
  {
    id: 'tpl-translate',
    title: 'Language Translator',
    content: `Translate the following text from [source_language] to [target_language]:

[paste text here]

Requirements:
- Maintain the original tone and style
- Preserve formatting (lists, headers, etc.)
- Use natural, idiomatic expressions in the target language
- Flag any culturally-specific terms that may need adaptation

Context: [brief context about where this text will be used]`,
    category: 'Writing',
    tags: ['translation', 'language', 'localization'],
    description: 'Translate text while preserving tone, style, and cultural context.',
    isSystem: true,
  },
  {
    id: 'tpl-cultural-adapt',
    title: 'Cultural Adaptation',
    content: `Adapt the following content for [target_culture/region]:

[paste content here]

Requirements:
- Adjust idioms, metaphors, and references to be culturally appropriate
- Modify examples to resonate with the target audience
- Preserve the core message and intent
- Note any changes made and why

Target audience: [who]
Purpose: [why this content is being adapted]`,
    category: 'Writing',
    tags: ['localization', 'culture', 'adaptation'],
    description: 'Adapt content for different cultures while preserving the original message.',
    isSystem: true,
  },

  // Professional Emails
  {
    id: 'tpl-professional-email',
    title: 'Professional Email',
    content: `Write a professional email:

**To:** [recipient]
**Purpose:** [what you want to achieve]
**Relationship:** [colleague, client, supervisor, etc.]
**Tone:** [formal, friendly, assertive]

**Key points to cover:**
1. [point 1]
2. [point 2]
3. [point 3]

**Context:**
[Any relevant background]

Requirements:
- Clear subject line suggestion
- Professional greeting and closing
- Concise, scannable body
- Clear call-to-action
- Appropriate level of formality`,
    category: 'Business',
    tags: ['email', 'professional', 'communication'],
    description: 'Write polished professional emails with clear structure and appropriate tone.',
    isSystem: true,
  },
  {
    id: 'tpl-follow-up-email',
    title: 'Follow-up Email',
    content: `Write a follow-up email:

**Context:** [what you're following up on — meeting, proposal, application, etc.]
**Time since last contact:** [days/weeks]
**Goal:** [what you want to happen next]

**Previous interaction:**
[Briefly describe what happened before]

Requirements:
- Reference the previous interaction naturally
- Reiterate your value/proposition briefly
- Provide new information or context if applicable
- Clear next step or call-to-action
- Professional but not pushy tone`,
    category: 'Business',
    tags: ['email', 'follow-up', 'sales'],
    description: 'Craft effective follow-up emails that advance the conversation.',
    isSystem: true,
  },
  {
    id: 'tpl-cold-outreach',
    title: 'Cold Outreach Email',
    content: `Write a cold outreach email:

**Recipient:** [name, title, company]
**Your offering:** [product/service/idea]
**Why them:** [specific reason you're reaching out to this person]

**Research about them:**
[Any relevant info — recent achievement, shared connection, company news]

Requirements:
- Compelling subject line (under 50 chars)
- Personalized opening (not generic)
- Brief value proposition (2-3 sentences)
- Social proof or credibility indicator
- Low-friction call-to-action
- Under 150 words total`,
    category: 'Business',
    tags: ['email', 'outreach', 'sales'],
    description: 'Write personalized cold outreach emails that get responses.',
    isSystem: true,
  },

  // Brainstorming
  {
    id: 'tpl-idea-generation',
    title: 'Idea Generator',
    content: `Generate ideas for:

**Topic/Challenge:** [what you need ideas for]
**Constraints:** [budget, time, resources, or other limitations]
**Target:** [who these ideas are for]

**Existing ideas to build on:**
[Any brainstorming already done]

**Avoid:**
[Things that have been tried or don't work]

Generate:
1. **10 diverse ideas** — ranging from practical to ambitious
2. **Top 3 recommendations** with brief feasibility assessment
3. **Wildcard idea** — something unconventional that might spark innovation
4. **Next steps** — how to validate and develop the top ideas`,
    category: 'Ideas',
    tags: ['brainstorming', 'creative', 'innovation'],
    description: 'Generate diverse, actionable ideas with feasibility assessment.',
    isSystem: true,
  },
  {
    id: 'tpl-brainstorm-framework',
    title: 'Structured Brainstorm',
    content: `Run a structured brainstorm session on:

**Challenge:** [the problem or opportunity]
**Participants:** [who would be involved]
**Time available:** [minutes]

**Ground rules:**
- No criticism during ideation
- Build on others' ideas
- Aim for quantity first, quality later
- Encourage wild ideas

Guide the brainstorm through:
1. **Divergent phase** — Generate as many ideas as possible (aim for 20+)
2. **Clustering** — Group related ideas into themes
3. **Convergent phase** — Evaluate using [criteria]
4. **Prioritization** — Rank top ideas by [impact/feasibility]
5. **Action planning** — Next steps for top 3 ideas`,
    category: 'Ideas',
    tags: ['brainstorming', 'facilitation', 'creative'],
    description: 'Facilitate a structured brainstorm session with divergent and convergent phases.',
    isSystem: true,
  },

  // Image Generation
  {
    id: 'tpl-midjourney-prompt',
    title: 'Midjourney Prompt',
    content: `Create a Midjourney prompt for:

**Subject:** [main subject of the image]
**Style:** [photorealistic, illustration, anime, oil painting, etc.]
**Mood:** [dramatic, peaceful, vibrant, moody, etc.]
**Setting:** [where the scene takes place]

**Additional elements:**
- Lighting: [natural, studio, golden hour, neon, etc.]
- Camera angle: [close-up, wide shot, bird's eye, etc.]
- Color palette: [specific colors or mood]

**Reference artists/styles:** [optional]
**Aspect ratio:** [--ar 16:9, --ar 1:1, --ar 9:16]

Generate 3 prompt variations with increasing detail and complexity.`,
    category: 'Creative',
    tags: ['midjourney', 'ai-art', 'image-generation'],
    description: 'Create detailed Midjourney prompts with style, lighting, and composition specs.',
    isSystem: true,
  },
  {
    id: 'tpl-dalle-prompt',
    title: 'DALL-E Prompt',
    content: `Create a DALL-E prompt for:

**Image description:** [what you want to see]
**Style:** [digital art, photograph, illustration, 3D render, etc.]
**Composition:** [how elements are arranged]
**Colors:** [dominant colors or palette]

**Specific details:**
- [Detail 1]
- [Detail 2]
- [Detail 3]

Requirements:
- Clear, descriptive language
- Avoid ambiguous terms
- Include perspective and framing
- Specify any text that should appear in the image

Generate 3 variations:
1. **Simple** — Clean, focused composition
2. **Detailed** — Rich in elements and atmosphere
3. **Artistic** — Creative interpretation with unique style`,
    category: 'Creative',
    tags: ['dalle', 'ai-art', 'image-generation'],
    description: 'Generate effective DALL-E prompts with clear descriptions and style specs.',
    isSystem: true,
  },
  {
    id: 'tpl-sd-prompt',
    title: 'Stable Diffusion Prompt',
    content: `Create a Stable Diffusion prompt for:

**Subject:** [main subject]
**Art style:** [realistic, anime, concept art, pixel art, etc.]
**Quality keywords:** [masterpiece, best quality, highly detailed, etc.]
**Lighting:** [rim lighting, soft lighting, volumetric, etc.]

**Positive prompt elements:**
- [element 1]
- [element 2]
- [element 3]

**Negative prompt (what to avoid):**
- [unwanted element 1]
- [unwanted element 2]

**Parameters:**
- Recommended CFG scale: [7-12]
- Sampler: [Euler a, DPM++ 2M Karras, etc.]
- Steps: [20-50]

Generate 3 variations optimized for different quality levels.`,
    category: 'Creative',
    tags: ['stable-diffusion', 'ai-art', 'image-generation'],
    description: 'Create optimized Stable Diffusion prompts with positive and negative keywords.',
    isSystem: true,
  },

  // Interviewing & Education
  {
    id: 'tpl-interview-questions',
    title: 'Interview Question Generator',
    content: `Generate interview questions for:

**Role:** [job title]
**Level:** [junior, mid, senior, lead]
**Type:** [technical, behavioral, cultural fit]
**Industry:** [tech, finance, healthcare, etc.]

**Key competencies to assess:**
1. [competency 1]
2. [competency 2]
3. [competency 3]

**Interview duration:** [minutes]
**Interview format:** [phone screen, on-site, panel]

Generate:
1. **Opening questions** (2-3) — Build rapport, understand background
2. **Core questions** (5-7) — Assess technical/functional skills
3. **Behavioral questions** (3-4) — Past experience examples
4. **Scenario questions** (2-3) — Problem-solving ability
5. **Closing questions** (2) — Candidate's questions, mutual fit

Include:
- What each question is designed to assess
- Red flags to watch for in answers
- Follow-up probes for each question`,
    category: 'Education',
    tags: ['interview', 'hiring', 'questions'],
    description: 'Generate comprehensive interview questions with assessment criteria and follow-ups.',
    isSystem: true,
  },
  {
    id: 'tpl-behavioral-interview',
    title: 'Behavioral Interview Prep',
    content: `Help me prepare for a behavioral interview:

**Role I'm interviewing for:** [position]
**Company:** [company name]
**Key competencies they're looking for:**
1. [competency 1]
2. [competency 2]
3. [competency 3]

**My relevant experiences:**
[Briefly describe 3-5 experiences you could discuss]

For each competency:
1. **STAR-formatted answer** — Situation, Task, Action, Result
2. **Quantifiable achievements** — Numbers and outcomes to highlight
3. **Common follow-up questions** — And how to answer them
4. **What the interviewer is really assessing** — Hidden criteria

Also provide:
- 3 questions I should ask the interviewer
- How to handle "Tell me about yourself"
- How to discuss weaknesses authentically`,
    category: 'Education',
    tags: ['interview', 'career', 'preparation'],
    description: 'Prepare for behavioral interviews with STAR-method answers and strategic insights.',
    isSystem: true,
  },
  {
    id: 'tpl-lesson-plan',
    title: 'Lesson Plan Creator',
    content: `Create a lesson plan for:

**Subject:** [topic]
**Audience:** [students/professionals, level]
**Duration:** [minutes]
**Learning objective:** [what students should be able to do after]

**Prerequisites:**
[What students should already know]

Generate:
1. **Warm-up** (5-10 min) — Engage prior knowledge
2. **Introduction** (10-15 min) — Present new concept
3. **Guided practice** (15-20 min) — Worked examples
4. **Independent practice** (15-20 min) — Hands-on activity
5. **Assessment** (5-10 min) — Check understanding
6. **Homework/follow-up** — Reinforce learning

Include:
- Materials needed
- Differentiation strategies (for different learning levels)
- Common misconceptions to address
- Discussion questions
- Success criteria for each activity`,
    category: 'Education',
    tags: ['teaching', 'lesson-plan', 'education'],
    description: 'Create structured lesson plans with activities, assessments, and differentiation.',
    isSystem: true,
  },

  // SEO
  {
    id: 'tpl-seo-brief',
    title: 'SEO Content Brief',
    content: `Create an SEO content brief for:

**Target keyword:** [primary keyword]
**Secondary keywords:** [2-3 related keywords]
**Search intent:** [informational, transactional, navigational]
**Target audience:** [who will read this]

**Competitor analysis:**
[Top 3 ranking URLs for this keyword]

Generate:
1. **Title tag** — Under 60 characters, includes keyword
2. **Meta description** — Under 155 characters, compelling CTA
3. **H1 heading** — Primary keyword, engaging
4. **Content structure:**
   - H2/H3 outline with target keywords
   - Recommended word count
   - Key topics to cover
5. **Internal linking opportunities** — Related pages to link to
6. **Featured snippet optimization** — How to win the snippet
7. **FAQ section** — 5 common questions to answer
8. **Image alt text suggestions** — For visual SEO`,
    category: 'Marketing',
    tags: ['seo', 'content', 'marketing'],
    description: 'Create comprehensive SEO content briefs with keyword strategy and structure.',
    isSystem: true,
  },
  {
    id: 'tpl-keyword-research',
    title: 'Keyword Research Prompt',
    content: `Help me with keyword research for:

**Website/Business:** [what you do]
**Industry:** [sector]
**Target market:** [geographic location, demographics]
**Current ranking keywords:** [any known rankings]

**Goals:**
- [ ] Find new keyword opportunities
- [ ] Analyze competitor keywords
- [ ] Identify long-tail variations
- [ ] Map keywords to content

Generate:
1. **Primary keywords** — 10 high-volume, relevant terms
2. **Long-tail keywords** — 15 specific, lower-competition phrases
3. **Question-based keywords** — 10 "how to", "what is" queries
4. **Competitor gaps** — Keywords competitors rank for that you don't
5. **Keyword clusters** — Group related keywords for content hubs
6. **Priority matrix** — Rank by search volume vs. competition vs. relevance
7. **Content recommendations** — Which keywords for which content types`,
    category: 'Marketing',
    tags: ['seo', 'keywords', 'research'],
    description: 'Conduct comprehensive keyword research with clustering and prioritization.',
    isSystem: true,
  },

  // Data Analysis
  {
    id: 'tpl-data-analysis',
    title: 'Data Analysis Prompt',
    content: `Analyze the following data:

**Data description:** [what this data represents]
**Data source:** [where it came from]
**Time period:** [date range]

[paste data or describe columns]

**Analysis goals:**
1. [goal 1]
2. [goal 2]
3. [goal 3]

**Questions to answer:**
- [question 1]
- [question 2]
- [question 3]

Generate:
1. **Data overview** — Summary statistics, data quality check
2. **Key findings** — Top 3-5 insights from the data
3. **Trends** — Patterns over time or across categories
4. **Anomalies** — Outliers or unexpected data points
5. **Correlations** — Relationships between variables
6. **Recommendations** — Data-driven actions
7. **Visualization suggestions** — Best chart types for this data
8. **Limitations** — What the data doesn't tell us`,
    category: 'Data',
    tags: ['analysis', 'statistics', 'insights'],
    description: 'Analyze datasets with statistical insights, trends, and actionable recommendations.',
    isSystem: true,
  },
  {
    id: 'tpl-ab-test',
    title: 'A/B Test Analyzer',
    content: `Help me analyze an A/B test:

**Test name:** [what you're testing]
**Hypothesis:** [what you expected to happen]
**Test duration:** [days/weeks]
**Sample size:** [number of users per variant]

**Results:**
- Variant A (control): [metric] = [value], n = [sample size]
- Variant B (treatment): [metric] = [value], n = [sample size]

**Statistical info:**
- Confidence level: [%]
- P-value: [value]
- Effect size: [value]

Generate:
1. **Result interpretation** — What the numbers actually mean
2. **Statistical significance** — Is this result real or noise?
3. **Practical significance** — Does the effect size matter?
4. **Segment analysis** — Any differences across user groups?
5. **Recommendation** — Ship, iterate, or kill?
6. **Follow-up tests** — What to test next
7. **Lesson learned** — What this tells us about our users`,
    category: 'Data',
    tags: ['ab-testing', 'statistics', 'optimization'],
    description: 'Analyze A/B test results with statistical rigor and actionable recommendations.',
    isSystem: true,
  },
];
