// The Kick Report — 1000 articles of the global wall-kick crisis.
// Metadata is authored; bodies are generated deterministically per article.

export const SECTIONS = {
  crisis:     { label: "The Crisis",        color: "#e5484d" },
  sleep:      { label: "Sleep Science",     color: "#f0921f" },
  behavior:   { label: "Behavioral Science",color: "#f0921f" },
  seismology: { label: "Seismology",        color: "#f0921f" },
  materials:  { label: "Materials",         color: "#f0921f" },
  tech:       { label: "Technology",        color: "#8ec63f" },
  lifestyle:  { label: "Lifestyle",         color: "#f0921f" },
  opinion:    { label: "Opinion",           color: "#f4efe6" },
  world:      { label: "World",             color: "#f0921f" },
  business:   { label: "Business",          color: "#8ec63f" },
};

// [section, title, dek]
const RAW = [
  ["crisis","Breaking: apartment building collapses after sustained wall kicks","The fictional WKD Night Desk reports that repeated 3:47 AM impacts cracked a shared wall, rattled the structure, and forced neighbors into bathrobes on the sidewalk."],
  ["crisis","A world that cannot sleep: wall kicks by the numbers","Region by region, we mapped where the walls are thinnest and the siblings are worst."],
  ["crisis","The 3 AM economy: what lost sleep is really costing families","The kick is free. The next day is not. A ledger of everything a single wake-up quietly bills you."],
  ["crisis","Inside the households where the wall never rests","Four families, one shared grievance, and a wall that transmits everything but remorse."],
  ["crisis","Mapping the thinnest walls on Earth","Some walls were built to divide rooms. Others were built to betray you. We measured both."],
  ["crisis","The apology deficit: why 'sorry' is going extinct","Household seismic events are up. Recorded apologies are flat at zero. The gap is widening."],
  ["crisis","Duplex dread: the rise of the shared-wall bedroom","Cheaper builds and thinner partitions have quietly weaponized the family home."],
  ["crisis","Sibling summits collapse as ceasefire talks break down","A promising 'walk quieter' accord fell apart within a single night. Again."],
  ["crisis","The quiet math of one bad night's sleep","One kick. Ninety lost minutes. A whole day rerouted around a yawn. The arithmetic is brutal."],
  ["crisis","Report: household seismic activity at an all-time high","Footsteps that sound like thunder are no longer an exception. They are the forecast."],

  ["sleep","The Silent Epidemic: how a single wall kick fractures an entire night","One 3 AM impact detonates a sleep cycle you spent ninety minutes building — and takes tomorrow with it."],
  ["sleep","Sleep cycles, interrupted: the ninety minutes you'll never get back","A kick doesn't just wake you. It resets a delicate, hard-won descent into deep sleep."],
  ["sleep","Why waking at 3 AM feels like fighting a bear","The body cannot tell a wall kick from a genuine threat. So it prepares for war, in bed."],
  ["sleep","Cortisol, adrenaline, and the biology of being launched awake","A sudden thump floods you with the exact chemicals designed to keep you alive — and awake."],
  ["sleep","REM under siege: the dream stages most vulnerable to a kick","The best dream you'll ever have is also the easiest one to shatter. We explain why."],
  ["sleep","The next-day tax: how one bad night wrecks tomorrow","Reaction time, mood, memory, patience — all quietly garnished by a single interruption."],
  ["sleep","Micro-arousals: the wake-ups you don't even remember","You think you slept through it. Your brain kept the receipts. Dozens of them."],
  ["sleep","Sleep debt is real, and your brother is the lender","The interest compounds nightly, and the terms were never disclosed to you."],
  ["sleep","Blue light is not your problem. Your wall is.","We spent a decade blaming phones. The real disruptor was six inches away the whole time."],
  ["sleep","The science of falling back asleep (and why you won't)","Once adrenaline is in the system, the door back to your dream locks behind you."],

  ["behavior","Why they kick: the nocturnal sibling, explained","Rage-quits, restless legs, and the enduring belief that the wall started it."],
  ["behavior","Rage-quit kinematics: the physics of a thrown controller","When the game is lost, the controller travels. We tracked its trajectory into the drywall."],
  ["behavior","Restless legs or restless intent? A field study","Involuntary movement, or a slow-motion declaration of war? The data is suggestive."],
  ["behavior","'It wasn't me': a taxonomy of sibling denial","We catalogued every excuse. There are, remarkably, only eleven, and none hold up."],
  ["behavior","The stretching defense: examining a national excuse","How one flimsy alibi came to explain away an entire epidemic of 2 AM impacts."],
  ["behavior","Learned helplessness in the perpetually kicked","What happens to a person who asks for quiet three thousand nights in a row."],
  ["behavior","Do kickers dream? And do they dream of kicking?","A look inside the mind of the person on the loud side of the wall."],
  ["behavior","The psychology of 'the wall started it'","On the strange human tendency to blame architecture for one's own feet."],
  ["behavior","Conditioning the kicker: what one loud ringtone teaches","Behavioral science says consequences must be immediate. A 2008 Nokia ringtone is nothing if not immediate."],
  ["behavior","Birth order and the propensity to kick: new data","Early findings suggest the wall is simply a middle child's canvas."],

  ["seismology","The thunderous walk: when footsteps hit the Richter scale","'Walk quieter' has a 0% documented success rate. We measured what one heavy step does to a house."],
  ["seismology","Measuring a single heavy step in a wood-frame house","One footfall, eight sensors, and a reading that genuinely alarmed our intern."],
  ["seismology","Why 'walk quieter' has a zero percent success rate","We ran the request 500 times across 40 households. Nothing. Not once. Ever."],
  ["seismology","Standing waves: how one wall becomes a subwoofer","Under the right conditions, a shared wall doesn't block sound. It amplifies it into your skull."],
  ["seismology","The heel-strike heard three rooms away","Tracing the shockwave of a single dropped heel from his floor to your pillow."],
  ["seismology","Foundations under fire: what nightly shaking does to a home","Structural engineers weigh in on a house that trembles like thunder after midnight."],
  ["seismology","P-waves, S-waves, and brother-waves","A new classification of vibration, proposed reluctantly, named regretfully."],
  ["seismology","Calibrating a seismograph to exactly one person","How we tuned professional equipment to ignore everything but a specific sibling."],
  ["seismology","The night the house registered a 4.1","A first-person account of the footstep that rattled the picture frames and ended a dream."],
  ["seismology","Vibration travels. So does resentment.","The physics of transmission, and the slower, deeper transmission of a grudge."],

  ["materials","Drywall: humanity's thinnest line of defense","Six inches of gypsum stand between you and chaos. Engineers laughed, then looked concerned."],
  ["materials","Six inches of gypsum: an engineering autopsy","We cut open a wall to understand exactly how little is protecting your sleep."],
  ["materials","Why builders chose the cheapest possible wall","A short, infuriating history of the partition that failed you."],
  ["materials","Soundproofing myths that cost you sleep","Egg cartons do nothing. We're sorry. Here is what the internet got wrong."],
  ["materials","The acoustics of the shared bedroom wall","How sound actually moves through the one surface you cannot escape."],
  ["materials","What a wall is actually made of (spoiler: not enough)","Paper, powder, and hope. A layer-by-layer look at your last defense."],
  ["materials","Insulation won't save you, but here's what might","The honest, mildly expensive truth about quieting a shared wall."],
  ["materials","The great mass-loaded vinyl debate","Two acoustic engineers, one bottle of wine, and a wall that would not shut up."],
  ["materials","Load-bearing and grudge-bearing: a wall's double life","It holds up the house and it holds a grudge. We interviewed the wall. It said nothing."],
  ["materials","Testing 12 walls so you don't have to","We kicked every common partition type. The results range from 'bad' to 'why.'"],

  ["tech","From 3:47 AM to a product: how we snapped","The exact night the idea was born, the failed prototypes, and the moment revenge became inevitable."],
  ["tech","Inside the 50-model AI that never blames the cat","How an ensemble of detectors tells a genuine 3 AM wall-kick from everything else in the house."],
  ["tech","Never trust the client: the security philosophy of a bedroom","Every component lives on your side of the wall. His room contains exactly zero hardware."],
  ["tech","Touchless, async, fully automated: the case for zero human input","You should not have to lift a finger to be defended. The system agrees, and lifts it for you."],
  ["tech","How Home Assistant became a weapon of sleep","An open-source hub, an Aqara sensor, and a grudge walk into a bedroom."],
  ["tech","The Aqara sensor: small device, enormous vendetta","A matchbox-sized sensor that feels every kick and forgives none of them."],
  ["tech","Sub-400ms retaliation: engineering the perfect comeback","The latency budget of revenge, measured to the millisecond."],
  ["tech","Why the whole system lives on your side of the wall","Architecture as strategy: nothing for him to unplug, cover, or 'accidentally' knock loose."],
  ["tech","The roadmap: a motorized door that kicks back","Our weirdest prototype yet fights kicks with a door. We don't fully understand it either."],
  ["tech","Local-first, cloud-never: privacy in home defense","No accounts, no servers, no subscriptions listening in. Just you, the wall, and consequences."],

  ["lifestyle","The roommate's guide to surviving a thin wall","Practical, petty, and peer-reviewed by people who have not slept in years."],
  ["lifestyle","Dorm life: sleeping through a stranger's chaos","What to do when the wall-kicker isn't even related to you."],
  ["lifestyle","How to arm a room without starting a war","A diplomat's approach to deploying a deeply undiplomatic device."],
  ["lifestyle","Twelve white-noise machines, ranked by desperation","From gentle rain to industrial fan, a countdown of things that almost work."],
  ["lifestyle","The petty person's guide to documented evidence","Timestamps win arguments. Here's how to keep the receipts your family will demand."],
  ["lifestyle","Earplugs, eye masks, and other things that don't work","A loving, honest teardown of the coping mechanisms you've already tried."],
  ["lifestyle","Negotiating a bedtime treaty with a sibling","How to draft terms, define a kick, and establish enforcement. Spoiler: automate enforcement."],
  ["lifestyle","What to say at the family meeting (with receipts)","Bring the log. Bring the graph. Bring the confidence of someone who finally slept."],
  ["lifestyle","Redecorating around a hostile wall","Move the bed. Move the desk. Move, if necessary, your entire sense of safety."],
  ["lifestyle","The art of the passive-aggressive door sign","When words have failed, laminate them and tape them at eye level."],

  ["opinion","Opinion: the wall owes us an apology","It has stood silently between us and rest for too long. It is not neutral. It is complicit."],
  ["opinion","Your brother is not 'just stretching'","We have all agreed to pretend. This column is where the pretending ends."],
  ["opinion","In defense of the loud ringtone","A once-maligned sound, reconsidered as an instrument of justice."],
  ["opinion","Sleep is a human right. So, arguably, is revenge.","On the moral case for a device that simply returns the energy it receives."],
  ["opinion","We should all be a little more petty","Pettiness, properly channeled, is just accountability with a sense of humor."],
  ["opinion","The case against forgiveness (at 3 AM)","Forgiveness is a daytime virtue. At 3 AM, the rules are different."],
  ["opinion","Why 'be the bigger person' is bad advice tonight","The bigger person is also the more tired person. Enough."],
  ["opinion","Automation is the only fair referee","Humans get emotional. The system does not. Let the machine keep the peace."],
  ["opinion","Stop apologizing for wanting to sleep","Rest is not a luxury you must earn by absorbing someone else's chaos."],
  ["opinion","The kicker will not change. The system must.","We spent years trying to fix the person. The wall taught us to fix the incentives."],

  ["world","Tokyo's paper walls and the etiquette of silence","In a city built on quiet, the shared wall carries a heavier social charge."],
  ["world","São Paulo duplexes and the war upstairs","Vertical living, thin slabs, and the footsteps that echo down through the ceiling."],
  ["world","Berlin's Altbau: beautiful, historic, acoustically doomed","High ceilings, ornate moldings, and walls that transmit a neighbor's every sigh."],
  ["world","New York shoebox apartments: everyone hears everything","In 400 square feet, the wall isn't a barrier. It's a conductor."],
  ["world","Mumbai joint families and the shared-wall economy","When three generations share a floor, the wall becomes the busiest surface in the home."],
  ["world","London terraced houses: 200 years of hearing the neighbors","Victorian charm, Victorian party walls, and a very modern lack of sleep."],
  ["world","Seoul officetels and the midnight thump","Compact towers, thin partitions, and the universal 2 AM footstep."],
  ["world","A dispatch from the world's thinnest wall","We traveled to find it. We regret to report that we heard everything."],
  ["world","How five countries cope with the nocturnal sibling","Different cultures, identical footsteps. A comparative look at coping."],
  ["world","The global map of who apologizes (almost no one)","Charting remorse across continents. The findings are consistent and bleak."],

  ["business","340% funded: inside the Wall Kick Defender Kickstarter","We hit our goal in 41 minutes. Every stretch goal since has just made the ringtones louder."],
  ["business","The subscription that reduces kicks even on the free tier","A pricing model where the worst plan still buys you meaningfully more sleep."],
  ["business","Why the free plan's 'ads' tell your brother to kick","Our most controversial feature: an 'ad break' that begs him to kick and quietly declines to retaliate."],
  ["business","Hardware once, peace forever: the one-time pricing bet","Why we refuse to hold your sleep hostage behind a monthly fee (mostly)."],
  ["business","The market for sleep is bigger than anyone admits","Everyone is tired. Almost no one has done the math on what that's worth."],
  ["business","Unit economics of a very petty startup","One sensor, one speaker, one grudge. The spreadsheet that shouldn't work, but does."],
  ["business","Scaling revenge: from one bedroom to thousands","How a single 3 AM grievance became a supply chain."],
  ["business","The stretch goals that just made the ringtones louder","Backers kept funding us. We kept turning it up. A retrospective."],
  ["business","Investors are awake. Literally. That's the problem.","Our seed round closed at 4 AM because nobody in the room could sleep."],
  ["business","Building a brand on a single 3 AM grievance","How the worst night of one person's sleep became a company."],
];

const AUTHORS = [
  "The WKD Research Desk","Dr. Priya Raman","Marcus Toll","L. Whitfield",
  "Sana Prakash","Devon Ainsley","The Night Desk","Aisha Rahim",
  "J. Okonkwo","Elena Vártova","The Sleep Bureau","Theo Marsh",
];

const SECTION_ORDER = ['crisis','sleep','behavior','seismology','materials','tech','lifestyle','world','opinion','business'];
const PLACES = [
  "Akron","Albany","Albuquerque","Anchorage","Ann Arbor","Asheville","Atlanta","Austin","Baltimore","Baton Rouge",
  "Belfast","Berlin","Birmingham","Boise","Boston","Brighton","Brooklyn","Brussels","Buenos Aires","Buffalo",
  "Calgary","Camden","Charlotte","Chicago","Cincinnati","Cleveland","Columbus","Copenhagen","Dallas","Denver",
  "Detroit","Dublin","Edinburgh","Eugene","Fresno","Glasgow","Halifax","Hamilton","Helsinki","Houston",
  "Indianapolis","Istanbul","Jacksonville","Kansas City","Kingston","Las Vegas","Lisbon","London","Long Beach","Los Angeles",
  "Louisville","Madison","Manchester","Melbourne","Memphis","Mexico City","Miami","Milwaukee","Minneapolis","Montreal",
  "Mumbai","Nashville","New Orleans","New York","Oakland","Oklahoma City","Omaha","Orlando","Osaka","Ottawa",
  "Paris","Philadelphia","Phoenix","Pittsburgh","Portland","Prague","Providence","Queens","Raleigh","Reykjavik",
  "Richmond","Rio de Janeiro","Sacramento","Salt Lake City","San Antonio","San Diego","San Francisco","Santiago","Sao Paulo","Seattle",
  "Seoul","Singapore","St. Louis","Stockholm","Sydney","Tacoma","Tampa","Tokyo","Toronto","Vancouver",
];
const LENSES = [
  "sleep lab opens a midnight file","engineers trace a drywall fault line","parents demand a vibration hearing",
  "tenants publish the thump ledger","acoustic panel test ends in disappointment","roommates form a quiet-hours union",
  "startup claims it can shame the wall","therapists name the dream-loss spiral","inspectors review the apology deficit",
  "developers promise thicker walls next time","neighbors audit every 3 AM footstep","student housing maps the loudest corridor",
  "apartment board considers a heel-strike tax","researchers test one more white-noise machine","family group chat requests hard evidence",
  "seismologists classify a brother-wave","sleep bureau issues a REM warning","product reviewers rank the retaliation tones",
  "night desk investigates a suspicious stretch","delivery driver hears the wall from outside","landlord blames the furniture again",
  "building committee proposes a kick curfew","school nurses track the next-day yawn rate","hardware lab tests sensor placement",
  "social feeds turn one thud into a movement","consumer desk reviews the no-mercy mode","city council debates shared-wall rights",
  "economists price the morning-after tax","designers redraw the bedroom floor plan","technicians tune the 2008 Nokia ringtone",
];
const INCIDENTS = [
  "a 3:47 AM drywall strike","a thunderous hallway walk","a rage-quit controller launch","an alleged stretching routine",
  "a heel drop heard three rooms away","a kick that cancelled the best dream","a picture-frame rattling event",
  "a midnight snack stampede","a bed-frame rebound strike","a laundry basket collision","a gaming chair wall check",
  "a door slam aftershock","a closet-to-wall miscalculation","a dramatic sock-slide impact","a failed quiet-hours promise",
  "a stairwell stomp relay","a double-kick denial episode","a late-night furniture shove","a subwoofer impersonation",
  "a toe-first apology refusal","a wall-tap escalation","a sleep-cycle ambush","a hallway thunder rehearsal",
  "a fake cough cover story","a barefoot Richter reading","a shared-wall aftershock","a pillow-punch misfire",
  "a shoe-drop cascade","a 2 AM pacing loop","a no-remorse thump",
];
const FINDINGS = [
  "lost sleep, tilted picture frames, and one very tired group chat",
  "a measurable spike in resentment before breakfast",
  "adrenaline levels high enough to ruin the next meeting",
  "a room full of witnesses who all heard the exact same thud",
  "one apology drafted, deleted, and never sent",
  "a defensive sensor log that made denial unusually difficult",
  "a white-noise machine quietly resigning from active duty",
  "neighbors comparing floor plans like crime-scene diagrams",
  "a family meeting that ended with everyone pointing at the wall",
  "a landlord email beginning with the words 'technically habitable'",
  "a sleep tracker graph shaped like a cliff",
  "an argument over whether thunder can wear socks",
  "a product review score that fell with every kick",
  "evidence packets exported before anyone found their slippers",
  "the phrase 'just walking' losing all legal force",
  "a stern reminder that free software still needs a physical device",
  "an ad-supported silence break arriving at the worst possible moment",
  "a hard look at the costs of having no defense at all",
  "footstep data that made the floor look guilty",
  "a day of yawning so severe it required its own minutes",
];
const DETAIL_BEATS = [
  "sensor logs, witness notes, and a crude floor plan taped to the refrigerator",
  "audio spikes, acceleration traces, and a timeline that starts exactly when the dream got good",
  "a lab notebook, two disposable coffee cups, and a wall that refused to cooperate",
  "a shared spreadsheet where every row is a thud and every comment says 'again'",
  "slow-motion footage, an embarrassed sibling, and a family council that kept minutes",
  "a mock inspection report rating the drywall 'emotionally unavailable'",
  "subscription-tier tests showing how much annoyance remains on Free",
  "product reviews comparing silence, retaliation, and doing absolutely nothing",
  "social posts from people who discovered that everyone is tired in the same way",
  "a device bill, a free-tier activation screen, and a reminder that software alone cannot touch a wall",
];

function generatedArticle(i) {
  const id = RAW.length + i + 1;
  const section = SECTION_ORDER[i % SECTION_ORDER.length];
  const place = PLACES[(i * 7 + section.length) % PLACES.length];
  const lens = LENSES[(i * 11 + id) % LENSES.length];
  const incident = INCIDENTS[(i * 13 + section.length) % INCIDENTS.length];
  const finding = FINDINGS[(i * 17 + id) % FINDINGS.length];
  const beat = DETAIL_BEATS[(i * 19 + id) % DETAIL_BEATS.length];
  return [
    section,
    `${place} dispatch ${String(id).padStart(4, "0")}: ${lens} after ${incident}`,
    `Reporters reviewed ${beat}; the early finding is ${finding}.`,
  ];
}

const GENERATED_RAW = Array.from({ length: 900 }, (_, i) => generatedArticle(i));
const ALL_RAW = [...RAW, ...GENERATED_RAW].slice(0, 1000);

function seed(n){ let s = n * 2654435761 % 2147483647; return () => (s = s * 16807 % 2147483647) / 2147483647; }

// invented dates spread across the crisis "coverage" window
function inventDate(i){
  const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const years=[2024,2024,2025,2025,2025,2026,2026];
  const r=seed(i+13);
  const y=years[Math.floor(r()*years.length)];
  const m=months[Math.floor(r()*12)];
  const d=1+Math.floor(r()*27);
  const h=String(Math.floor(r()*4)).padStart(2,"0"); // wee hours, of course
  const min=String(Math.floor(r()*60)).padStart(2,"0");
  return `${m} ${d}, ${y} · ${h}:${min} AM`;
}

export const ARTICLES = ALL_RAW.map((r,i)=>({
  id:i+1,
  section:r[0],
  title:r[1],
  dek:r[2],
  author:AUTHORS[i%AUTHORS.length],
  date:i === 0 ? "Apr 1, 2026 · 03:47 AM" : inventDate(i),
  read:`${3+Math.floor(seed(i+7)()*9)} min read`,
  cover:i+1,
}));

// Deterministic article body built from the recurring themes: wall kicks,
// thunderous walking, device accountability, and the dream that got deleted.
export function buildBody(a){
  const r = seed(a.id * 101);
  const pick = arr => arr[Math.floor(r()*arr.length)];
  const stat = () => (10+Math.floor(r()*89));
  const sec = SECTIONS[a.section] || SECTIONS.crisis;
  const hour = `${String(1+Math.floor(r()*4))}:${String(Math.floor(r()*60)).padStart(2,"0")} AM`;

  if (a.id === 1) {
    return [
      { t:"p", v:`The first report reached the WKD Night Desk at 3:47 AM, when residents of a small apartment block stepped outside in bathrobes and pointed, almost in unison, at the shared wall that had been taking kicks for weeks.` },
      { t:"p", v:`Witnesses described a sequence of impacts that began as ordinary sibling thunder, escalated into a visible crack, and ended with part of the facade slumping into a pile of brick, plaster, dust, and deeply avoidable consequences.` },
      { t:"quote", v:`"He said it was stretching. Then the building stretched."` },
      { t:"p", v:`No serious injuries were reported in this fictional dispatch, but emergency crews did record widespread loss of sleep, three spilled mugs of chamomile tea, and one neighbor who kept repeating, "I told everyone the wall was making a sound."` },
      { t:"p", v:`Structural reviewers were careful not to blame one kick alone. Their preliminary note points instead to repeated overnight impacts, a thin partition, loose masonry, denial, and the ancient household belief that walls are somehow responsible for what feet do to them.` },
      { t:"p", v:`A vibration trace recovered from a nearby Defender sensor shows a rising pattern: tap, thud, double thud, apology refusal, then a final spike strong enough to make the kitchen clock fall behind by twelve minutes.` },
      { t:"quote", v:`"The wall did not fail suddenly. It spent weeks filing complaints in the only language it had: cracks."` },
      { t:"p", v:`Neighbors said the most alarming detail was not the collapse itself but the familiarity of the sound before it. Several had heard the same deep, rolling thump in their own rooms and assumed they were being dramatic. The rubble, they now argue, was dramatic too.` },
      { t:"p", v:`The Free tier would have detected the sequence, but with ad breaks and only one starter ringtone, it might have spent crucial seconds reminding everyone that Plus removes Sponsored Silence. Investigators described that as "not ideal, but still better than owning nothing and hoping drywall develops a conscience."` },
      { t:"p", v:`By sunrise, the sidewalk had become a newsroom: residents swapping timestamps, product reviewers testing sensor mounts against the remaining wall, and social posts multiplying under the same blunt headline: stop kicking the building.` },
      { t:"p", v:`The official fictional recommendation was simple enough to fit on a warning placard: buy the device, arm the wall, record the receipts, and preserve enough evidence that the kicker can be sued in court by a very tired person with a folder.` },
    ];
  }

  const opens = [
    `It always begins the same way: a person, asleep, mid-dream — the good one, the one you can never get back — and then the wall speaks.`,
    `The kick came at ${String(1+Math.floor(r()*3))}:${String(Math.floor(r()*60)).padStart(2,"0")} AM, and with it went the best dream of the year.`,
    `There is no sound quite like a heavy footstep in the next room. It is not walking. It is thunder that pays rent.`,
    `Ask anyone who shares a wall and they'll describe the same violence: deep sleep, then a thud, then the ceiling of a dream collapsing inward.`,
  ];
  const bodies = [
    `The wall kick is deceptively simple. A foot meets drywall; the drywall, having no loyalty to anyone, transmits the impact directly into the skull of whoever was foolish enough to be dreaming next door.`,
    `Loud walking is the crisis's quieter cousin. It does not announce itself as an attack. It simply shakes the house like thunder until the pictures tilt and the sleeper surfaces, heart already racing.`,
    `Our correspondents documented ${stat()} separate incidents in a single week. In ${stat()}% of them, the sleeper was, by their own account, "in the middle of the best dream I've had in months."`,
    `The cruelty is in the timing. The deepest sleep — and the richest dreams — arrive in the small hours, which is precisely when the footsteps begin and the wall begins to broadcast.`,
    `What makes it unbearable is not the noise itself but the theft: you are not merely woken, you are evicted from a dream mid-sentence, with no forwarding address.`,
  ];
  const methods = [
    `For this ${sec.label.toLowerCase()} file, reporters compared sensor logs, family testimony, product notes, and the sacred household archive known as "texts sent while furious and tired."`,
    `The timeline begins at ${hour}, when the first vibration ping arrived. Within ${stat()} minutes, the wall had produced enough data to make denial look more like performance art than a defense.`,
    `Editors also reviewed social posts from the same night. The language varied by city, but the structure was identical: excellent dream, sudden thud, instant rage, doomed morning.`,
    `Product reviewers re-created the event with the Defender on a table, a speaker on the safe side of the wall, and a technician whose official job title was "please kick less hard."`,
  ];
  const stakes = [
    `Doing nothing remains the most expensive plan. It costs no money at checkout, then bills the sleeper in missed alarms, bad moods, lost focus, family meetings, and the specific grief of never learning how the dream ended.`,
    `The free membership tier changes the math, but not the hardware requirement: you still have to buy a device, mount it on your side of the wall, and accept that ad-supported peace comes with intentional annoyances.`,
    `Those annoyances matter. Sponsored Silence pauses retaliation, offers the kicker a tiny motivational message, and then resumes defense after everyone has had a moment to regret their choices.`,
    `Paid tiers remove the betrayal, unlock source-code links for the tier logic, and turn the system from "helpful witness" into "unreasonably prepared night clerk" with enough receipts to argue that the kicker can be sued in court.`,
  ];
  const quotes = [
    `"I was flying. Then the wall shook like thunder and I was awake, furious, and very much not flying."`,
    `"He says it's just walking. My picture frames disagree."`,
    `"It's not the kick. It's that I'll never know how the dream ended."`,
    `"Six inches of drywall. That's the entire relationship between his feet and my sleep."`,
    `"The device did not make me petty. It made me organized."`,
    `"Before the sensor, all I had was vibes. Now I have timestamps, waveforms, and eye contact."`,
  ];
  const experts = [
    `Sleep researchers note that a single abrupt awakening can flush the system with adrenaline for up to ${stat()} minutes — long enough to guarantee the dream is gone and the night is compromised.`,
    `Acoustic engineers we consulted confirmed that a shared wall does not so much block a footstep as forward it, "like a subwoofer nobody asked for," one said, declining to be named for fear of his own brother.`,
    `Behavioral analysts point to a stubborn pattern: the request to "walk quieter" is honored, on average, for less than one night before thunder resumes.`,
    `Materials specialists focused on the boring truth: drywall is not a mediator, a therapist, or a judge. It is paper, gypsum, and a willingness to betray both rooms equally.`,
  ];
  const reviews = [
    `In product testing, the strongest scores came from setups that combined vibration detection, a local speaker, receipt recording, and the Court Simulator's mock exhibit binder. The weakest scores came from "asking nicely" and "hoping the next kick is the last one."`,
    `Social review panels were less formal but more vivid. One tester gave the system five stars because, in their words, "for once the wall had a lawyer." Another removed one star because Free tier ads are "psychologically loud."`,
    `The consumer desk recommends starting with the physical kit first, then choosing a membership. Free is a plan, not a magic spell; no sensor means no detection, no log, no ringtone, and no useful argument at breakfast.`,
  ];
  const closes = [
    `Which is why the case for a touchless, async, fully automated defense keeps making itself — quietly, on your side of the wall, while you finally get to finish the dream.`,
    `The wall will not apologize. The footsteps will not soften. But the incentives, at last, can be rewritten.`,
    `Until the kicking stops, the research continues. Mostly because the researcher, once again, cannot sleep.`,
    `The conclusion is not subtle: without the device, you have a complaint. With it, you have a record, a response, and a tiny orange button that says the wall is done negotiating.`,
  ];

  return [
    { t:"p", v: pick(opens) },
    { t:"p", v: `This dispatch, "${a.title}", sits in the ${sec.label} archive because the pattern has become too consistent to dismiss as one unlucky night.` },
    { t:"p", v: pick(bodies) },
    { t:"p", v: pick(methods) },
    { t:"quote", v: pick(quotes) },
    { t:"p", v: pick(experts) },
    { t:"p", v: pick(stakes) },
    { t:"p", v: pick(bodies) },
    { t:"p", v: pick(reviews) },
    { t:"quote", v: pick(quotes) },
    { t:"p", v: pick(experts) },
    { t:"p", v: pick(closes) },
  ];
}
