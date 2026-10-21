# Search Queries for Job Scraper (India Market)

## Installed portal CLIs (primary for `/scrape`)

`/scrape` discovers portal skills under `.agents/skills/*/SKILL.md` and runs their CLIs first.
Shipped country-agnostic CLIs include `linkedin-search` and `freehire-search`.

### LinkedIn CLI Usage Examples for India:
```bash
bun run .agents/skills/linkedin-search/cli/src/cli.ts search -q "Data Science Intern" -l "Bengaluru, Karnataka, India" --jobage 14 --format table
bun run .agents/skills/linkedin-search/cli/src/cli.ts search -q "Machine Learning Intern" -l "Pune, Maharashtra, India" --jobage 14 --format table
bun run .agents/skills/linkedin-search/cli/src/cli.ts search -q "Data Analyst Intern" -l "Remote" --jobage 14 --format table
bun run .agents/skills/linkedin-search/cli/src/cli.ts search -q "AI Intern" -l "Nagpur, Maharashtra, India" --jobage 30 --format table
```

### Freehire CLI Usage Examples for Remote/India:
```bash
bun run .agents/skills/freehire-search/cli/src/cli.ts search -q "data science" --region apac --remote remote --format table
bun run .agents/skills/freehire-search/cli/src/cli.ts search -q "machine learning" --remote remote --format table
```

---

## Search Sites (Fallback / Web Search)

Primary:
- **linkedin.com/jobs** - Filter: India (Bengaluru, Pune, Nagpur, Remote)
- **naukri.com** - Leading job portal in India
- **internshala.com** - Leading internship portal in India for freshers/students
- **wellfound.com** (AngelList) - Leading startup jobs/internships portal

---

## Query Categories

### Priority 1: Data Science & AI Internships
Targeting core AI, Machine Learning, and Data Science internship roles.
```
site:linkedin.com/jobs "Data Science Intern" India
site:linkedin.com/jobs "Machine Learning Intern" Bengaluru OR Pune
site:linkedin.com/jobs "AI Intern" Remote OR Pune
site:internshala.com "Data Science" internship
site:naukri.com "Machine Learning Intern"
```

### Priority 2: Data Analyst & Business Intelligence Internships
Targeting data analytics, SQL, EDA, and reporting roles.
```
site:linkedin.com/jobs "Data Analyst Intern" Bengaluru OR Pune OR Remote
site:linkedin.com/jobs "Junior Data Analyst" India
site:naukri.com "Data Analyst Intern" Python SQL
site:internshala.com "Data Analyst" internship
```

### Priority 3: Python & Machine Learning Engineering (Entry-Level)
Entry-level software/ML engineering roles using Python stack.
```
site:linkedin.com/jobs "Junior ML Engineer" India
site:linkedin.com/jobs "Python Developer Intern" Remote OR Pune OR Bengaluru
site:naukri.com "Fresher Python Machine Learning"
```

---

## Location & Work Mode Filter
- **Preferred Locations:**
  - Remote (Highest flexibility)
  - Pune, Maharashtra, India
  - Bengaluru, Karnataka, India
  - Nagpur, Maharashtra, India (Local)
- **Job Types:**
  - Internship / Trainee
  - Entry-Level / Fresher (0-1 years)

## Language Filter
- English (Full professional proficiency)
- Hindi (Native / bilingual)
