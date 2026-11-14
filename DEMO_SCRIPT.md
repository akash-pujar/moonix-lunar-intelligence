# 🎬 MOONIX Demo Script

## "Mission Delayed — Find the Best Landing Window"

> **Target audience:** NASA Space Apps Challenge judges
> **Total demo time:** ~3 minutes
> **Goal:** Show how MOONIX helps a mission planner react to a schedule slip
> by comparing sites and dates in seconds.

---

## Scenario

A crewed mission is planned for **March 1, 2027** at **Shackleton Rim** — a
prime south-polar site with near-permanent illumination and Earth visibility.
Two weeks before launch, the mission is **delayed by 14 days**. The planning
team needs to answer:

1. How do conditions change at Shackleton Rim on the new date?
2. Is there a **better alternative site** for the delayed window?

---

## Step-by-Step Walkthrough

### Step 1 — Open MOONIX & Select Site
**⏱ Target: < 5 seconds**

1. Open MOONIX in the browser.
2. The app loads with **Shackleton Rim** pre-selected (default site).
3. Set the mission date to **March 1, 2027** using the date picker.

> **Talking point:** *"MOONIX pre-loads with a south-polar site — exactly where
> Artemis missions are targeting. Let's see the conditions for our planned
> landing date."*

---

### Step 2 — Review Conditions for Original Date
**⏱ Target: < 10 seconds**

1. Observe the **Sun Tracker** panel — note the sun elevation and whether it's
   above the horizon.
2. Check the **Earth Tracker** panel — note Earth visibility for communications.
3. Read the **Viability Score** — note the colour (green/amber/red) and the
   percentage.

> **Talking point:** *"On March 1st at Shackleton Rim we see [X]% solar
> availability and [Y]% Earth visibility. The viability score is [Z] — rated
> [green/amber/red]."*

---

### Step 3 — Apply the 14-Day Delay
**⏱ Target: < 5 seconds**

1. Locate the **Date-Slip** control.
2. Shift the date by **+14 days** (to March 15, 2027).
3. Watch the dashboard update instantly.

> **Talking point:** *"Now our mission slips two weeks. With one click we see
> how every metric changes — no re-running a simulation, no waiting."*

---

### Step 4 — Compare Viability Scores
**⏱ Target: < 10 seconds**

1. Note the new viability score for Shackleton Rim on March 15.
2. Mentally (or verbally) compare with the March 1 score from Step 2.
3. Highlight whether conditions improved, worsened, or stayed similar.

> **Talking point:** *"The score went from [Z₁] to [Z₂]. That's a
> [better/worse] window for power and comms — and we found out in under 10
> seconds."*

---

### Step 5 — Add a Comparison Site
**⏱ Target: < 5 seconds**

1. Open the **site selector** dropdown.
2. Select **Malapert Massif** as the comparison site.
3. A second column of metrics appears side-by-side.

> **Talking point:** *"But what if there's a better site for this delayed
> window? Let's compare with Malapert Massif, another polar candidate just
> 120 km away."*

---

### Step 6 — Compare Both Sites
**⏱ Target: < 10 seconds**

1. Compare viability scores side-by-side for March 15, 2027.
2. Note differences in solar availability and Earth visibility.
3. Check if either site has a notably longer darkness or comm-outage period.

> **Talking point:** *"Side by side, we can see that [Site A] scores [X] while
> [Site B] scores [Y]. The key difference is [solar/comms metric]."*

---

### Step 7 — Identify the Best Scenario
**⏱ Target: < 5 seconds**

1. Summarise: which combination of site + date gives the best viability?
2. State the recommendation.

> **Talking point:** *"In under two minutes we've answered both questions: the
> delay [does/doesn't] significantly affect Shackleton Rim, and [Malapert
> Massif is/isn't] a better alternative. That's the power of MOONIX — instant
> trade studies for lunar mission planning."*

---

## Key Talking Points for Judges

| Theme | Message |
|-------|---------|
| **Problem** | Mission schedules slip. Planners need to re-evaluate sites and dates quickly. |
| **Solution** | MOONIX provides instant visual feedback on sun/Earth geometry for any site and date combination. |
| **Data** | Built on NASA NAIF SPICE ephemeris — the same data source used by real missions. |
| **Differentiator** | Real-time comparison, date-slip analysis, and viability scoring — no existing public tool combines these for lunar surface planning. |
| **Extensibility** | Terrain horizon profiles, additional sites, and longer time ranges can be added with the existing pipeline. |
| **Accessibility** | Runs in a browser — no installation, no MATLAB licence, no special hardware. |

---

## Timing Summary

| Step | Action | Target Time |
|------|--------|-------------|
| 1 | Select site & date | < 5 s |
| 2 | Review conditions | < 10 s |
| 3 | Apply date slip | < 5 s |
| 4 | Compare scores | < 10 s |
| 5 | Add comparison site | < 5 s |
| 6 | Side-by-side comparison | < 10 s |
| 7 | State recommendation | < 5 s |
| | **Total interaction time** | **< 50 s** |

> The rest of the 3-minute demo is narration, context-setting, and Q&A.

---

## Backup Scenarios

If judges ask "what else can it do?", demonstrate:

1. **Different latitude:** Switch to **Aristarchus Plateau** (mid-latitude) to
   show dramatically different sun/Earth behaviour.
2. **Weight adjustment:** Slide power/comms weights to show how viability
   changes for a solar-dependent vs comms-dependent mission.
3. **Explorer mode:** Scrub through the timeline to show sun/Earth paths
   animated over a full lunar day.

---

*Prepared for NASA Space Apps Challenge presentation*
