// Podium quips data extracted from CSV
interface PodiumQuipSet {
  update: string;
  twoWayTie: string;
  threeWayTie: string;
  noScore: string;
}

export const podiumQuips: Record<number, PodiumQuipSet> = {
  100: {
    update: "Here we go! {leader} takes the very first lead by {margin}! {loser} is stuck in the gates!",
    twoWayTie: "UNBELIEVABLE! We have a tie! {name1} and {name2} share the crown! Rock, Paper, Scissors to decide the winner!",
    threeWayTie: "UNPRECEDENTED! A three-way tie! {name1}, {name2}, and {name3} all win the crown! Cut it into thirds!",
    noScore: "GAME OVER (this round). You all scored 0. Hang your heads in shame."
  },
  99: {
    update: "And they're racing! {leader} leads by {margin}. {loser} missed the start.",
    twoWayTie: "Like a stubby holder and a cold one. {name1} and {name2} are hugging.",
    threeWayTie: "Like a three-ring circus. {name1}, {name2}, and {name3} are clowns.",
    noScore: "Epic fail. Put it on YouTube."
  },
  98: {
    update: "{leader} gets the nose in front by {margin}. {loser} is behind.",
    twoWayTie: "Like a beach cricket game and a dispute. {name1} and {name2} are arguing.",
    threeWayTie: "Like a three-course meal. {name1}, {name2}, and {name3} are satisfying.",
    noScore: "Wipe the slate clean? It's already clean. No points."
  },
  97: {
    update: "{leader} is first to move, up by {margin}. {loser} is stationary.",
    twoWayTie: "Like a mullet and a moustache. {name1} and {name2} are a classic combo.",
    threeWayTie: "Like a three-piece suit. {name1}, {name2}, and {name3} look sharp.",
    noScore: "The vibe is off. The points are off. Everything is off."
  },
  96: {
    update: "{leader} jumps ahead by {margin}. {loser} stays back.",
    twoWayTie: "Like a bouncer and sneakers. {name1} and {name2} are saying 'not tonight'.",
    threeWayTie: "Like a triangle solo. {name1}, {name2}, and {name3} *ding*.",
    noScore: "Glitch in the matrix? Or just bad taste? Zero points."
  },
  95: {
    update: "{leader} starts well, leading by {margin}. {loser} starts poorly.",
    twoWayTie: "Like a wet dog in a ute. {name1} and {name2} smell like victory.",
    threeWayTie: "Like a trident. {name1}, {name2}, and {name3} are sharp.",
    noScore: "Denied! The DJ says no."
  },
  94: {
    update: "{leader} is quick, up by {margin}. {loser} is slow.",
    twoWayTie: "Like a possum on a roof. {name1} and {name2} are making noise together.",
    threeWayTie: "Like a trilogy. {name1}, {name2}, and {name3} are an epic saga.",
    noScore: "Spectacular failure. I'm almost impressed."
  },
  93: {
    update: "{leader} is off the mark, leading by {margin}. {loser} is on zero.",
    twoWayTie: "Like a warm toilet seat. {name1} and {name2} are uncomfortably close.",
    threeWayTie: "Like a triathalon. {name1}, {name2}, and {name3} are swimming, riding, and running.",
    noScore: "You missed the target. You missed the barn. You missed the farm."
  },
  92: {
    update: "{leader} takes an early lead of {margin}. {loser} is watching.",
    twoWayTie: "Like a loud shirt on a Friday. {name1} and {name2} are clashing.",
    threeWayTie: "Like a trifecta. {name1}, {name2}, and {name3} pay big dividends.",
    noScore: "Ghost town. Tumbleweeds blowing across the scoreboard."
  },
  91: {
    update: "{leader} is settling in, up by {margin}. {loser} is unsettled.",
    twoWayTie: "Like sand in your car. {name1} and {name2} are everywhere.",
    threeWayTie: "Like a triple cheeseburger. {name1}, {name2}, and {name3} are heavy.",
    noScore: "A collective brain fart. No one picked it."
  },
  90: {
    update: "Early days! {leader} leads by {margin}. {loser} hasn't started.",
    twoWayTie: "Like a free ride when you've already paid. {name1} and {name2} are confused.",
    threeWayTie: "Like a triple bogey. {name1}, {name2}, and {name3} are way over par.",
    noScore: "The silence is deafening. Scoreboard unchanged."
  },
  89: {
    update: "{leader} is alert, up by {margin}. {loser} is asleep.",
    twoWayTie: "Like rain on a wedding day. {name1} and {name2} are ironic.",
    threeWayTie: "Like a triangle choke. {name1}, {name2}, and {name3} are tapping out.",
    noScore: "Are you even trying? Seriously?"
  },
  88: {
    update: "{leader} is keen, leading by {margin}. {loser} is bored.",
    twoWayTie: "Like a plugger and a blowout. {name1} and {name2} are a tragic pair.",
    threeWayTie: "Like the stumps. {name1} is off, {name2} is leg, {name3} is middle.",
    noScore: "Fail army has arrived. Population: You lot."
  },
  87: {
    update: "{leader} is showing promise, up by {margin}. {loser} is showing nothing.",
    twoWayTie: "Like a magpie and a cyclist's ear. {name1} and {name2} are connecting.",
    threeWayTie: "Like a three-pronged plug. {name1}, {name2}, and {name3} are grounded.",
    noScore: "Like a warm beer. Disappointing and flat."
  },
  86: {
    update: "{leader} is quick out of the blocks, leading by {margin}. {loser} is slow.",
    twoWayTie: "Like a ute and a aggressive bumper sticker. {name1} and {name2} go together.",
    threeWayTie: "Kath, Kim and Sharon. {name1}, {name2}, and {name3} are foxy ladies.",
    noScore: "Lost the plot. Completely."
  },
  85: {
    update: "{leader} is establishing dominance early, up by {margin}. {loser} is weak.",
    twoWayTie: "Like a hipster and a craft beer. {name1} and {name2} are matched.",
    threeWayTie: "Ed, Edd n Eddy. {name1}, {name2}, and {name3} are scamming for jawbreakers.",
    noScore: "You all zigged when you should have zagged."
  },
  84: {
    update: "{leader} grabs the lead by {margin}. {loser} is chasing.",
    twoWayTie: "Like a boomer and a property portfolio. {name1} and {name2} are holding on tight.",
    threeWayTie: "The Powerpuff Girls. {name1}, {name2}, and {name3} are saving the world.",
    noScore: "Worse than a swooping magpie. Zero points."
  },
  83: {
    update: "{leader} is moving well, leading by {margin}. {loser} is stiff.",
    twoWayTie: "Gravity is working on both of them. {name1} and {name2} are grounded together.",
    threeWayTie: "Three little pigs. {name1}, {name2}, and {name3} are building houses.",
    noScore: "Zip. Nada. Nuthin'. Diddly squat."
  },
  82: {
    update: "{leader} is ticking over, up by {margin}. {loser} is stalled.",
    twoWayTie: "Like flies on a windscreen. {name1} and {name2} are stuck.",
    threeWayTie: "Three wise monkeys. {name1}, {name2}, and {name3} see no evil.",
    noScore: "Facepalm. A collective facepalm."
  },
  81: {
    update: "{leader} is on the board, leading by {margin}. {loser} is waiting.",
    twoWayTie: "System error: Too much winning. {name1} and {name2} are tied.",
    threeWayTie: "Like a juggler with three chainsaws. {name1}, {name2}, and {name3} are dangerous.",
    noScore: "A comedy of errors. But no one is laughing."
  },
  80: {
    update: "{leader} is looking lively, up by {margin}. {loser} is sluggish.",
    twoWayTie: "Cannot compute! {name1} and {name2} have broken the scoreboard.",
    threeWayTie: "Like the recycling bin logos. {name1}, {name2}, and {name3} are going in circles.",
    noScore: "Gutter ball. Straight into the channel."
  },
  79: {
    update: "{leader} is making early gains, leading by {margin}. {loser} is losing ground.",
    twoWayTie: "Like a snag in bread. {name1} and {name2} are a unit.",
    threeWayTie: "Like a pawnbroker's sign (three balls). {name1}, {name2}, and {name3} are golden.",
    noScore: "Sucked in! The Hottest 100 tricked you all."
  },
  78: {
    update: "{leader} is starting to hustle, up by {margin}. {loser} is napping.",
    twoWayTie: "Doppelgängers! {name1} and {name2} are seeing double.",
    threeWayTie: "Triple shot latte. {name1}, {name2}, and {name3} are buzzing.",
    noScore: "Dud round. Complete dud."
  },
  77: {
    update: "{leader} is finding their feet, leading by {margin}. {loser} is tripping over.",
    twoWayTie: "Like the Princes Highway, {name1} and {name2} are jammed together.",
    threeWayTie: "Third wheel? No, it's a unicycle built for three. {name1}, {name2}, and {name3} are balancing.",
    noScore: "You lot are all hat and no cattle. Zero."
  },
  76: {
    update: "{leader} is getting warm, up by {margin}. {loser} is cold.",
    twoWayTie: "A perfect pair. {name1} and {name2} are holding hands.",
    threeWayTie: "Like a three-legged race. {name1}, {name2}, and {name3} are stumbling to glory.",
    noScore: "Like a shark in a swimming pool—unwelcome news. No one scored."
  },
  75: {
    update: "First quarter done. {leader} leads by {margin}. {loser} is waking up.",
    twoWayTie: "Like a round of beers, {name1} and {name2} are shouting each other.",
    threeWayTie: "Alvin and the Chipmunks. {name1}, {name2}, and {name3} are high pitched.",
    noScore: "Fizzer! A total non-event."
  },
  74: {
    update: "{leader} is in the mix, up by {margin}. {loser} is confused.",
    twoWayTie: "Echo! {name1} says score, {name2} repeats it.",
    threeWayTie: "Macbeth's witches. {name1}, {name2}, and {name3} are stirring the pot.",
    noScore: "Knock knock. Who's there? No one. No one got points."
  },
  73: {
    update: "{leader} is keeping pace, leading by {margin}. {loser} is lagging.",
    twoWayTie: "Stuck like sh*t to a blanket. {name1} and {name2} are tied.",
    threeWayTie: "Like the three bears. {name1}, {name2}, and {name3} are just right.",
    noScore: "Bleak city. No points for anyone."
  },
  72: {
    update: "{leader} is staying calm, up by {margin}. {loser} is panicking.",
    twoWayTie: "Like a tradie and an iced coffee. {name1} and {name2} are inseparable.",
    threeWayTie: "Waiting for a mate? No, waiting for two mates. {name1}, {name2}, and {name3} are here.",
    noScore: "Up the creek without a paddle. And the canoe is leaking."
  },
  71: {
    update: "{leader} is holding firm, leading by {margin}. {loser} is wobbling.",
    twoWayTie: "Siamese twins! {name1} and {name2} are joined at the hip.",
    threeWayTie: "Like three snags on a single slice of bread. {name1}, {name2}, and {name3} are precarious.",
    noScore: "Cactus. This round is absolutely cactus."
  },
  70: {
    update: "{leader} takes the advantage, up by {margin}. {loser} is under pressure.",
    twoWayTie: "Like a blister, {name1} and {name2} just won't go away.",
    threeWayTie: "Crowded on the bench seat of a ute. {name1}, {name2}, and {name3} are shoulder to shoulder.",
    noScore: "Piss poor effort. Try harder next time."
  },
  69: {
    update: "{leader} is ahead by {margin}. {loser} is behind.",
    twoWayTie: "Nice. {name1} and {name2} are tied. Nice.",
    threeWayTie: "INXS (Hutchence + 2). {name1}, {name2}, and {name3} need you tonight.",
    noScore: "Embarrassing. My nan could pick better songs and she's deaf."
  },
  68: {
    update: "{leader} is pushing, up by {margin}. {loser} is pulling.",
    twoWayTie: "Parallel parking. {name1} and {name2} are perfectly aligned.",
    threeWayTie: "Midnight Oil (The drum, bass and guitar section). {name1}, {name2}, and {name3} are burning beds.",
    noScore: "Looks like a graffiti wall—blank. No scores."
  },
  67: {
    update: "{leader} is working hard, leading by {margin}. {loser} is hardly working.",
    twoWayTie: "Like bin chickens on a rubbish truck, {name1} and {name2} are riding high together.",
    threeWayTie: "Regurgitator. {name1}, {name2}, and {name3} like your old stuff better.",
    noScore: "You missed the bus. And the train. And the taxi."
  },
  66: {
    update: "{leader} is finding rhythm, up by {margin}. {loser} is off beat.",
    twoWayTie: "Double yoke! {name1} and {name2} are cracking eggs.",
    threeWayTie: "Living End. {name1}, {name2}, and {name3} are prisoners of society.",
    noScore: "Two tenths of bugger all. That's what you scored."
  },
  65: {
    update: "{leader} is edging ahead, leading by {margin}. {loser} is slipping back.",
    twoWayTie: "Two-up! Both coins landed heads. {name1} and {name2} win.",
    threeWayTie: "Wolfmother. {name1}, {name2}, and {name3} are woman (or man).",
    noScore: "Radio silence. Literally."
  },
  64: {
    update: "{leader} is solid, up by {margin}. {loser} is shaky.",
    twoWayTie: "Like a 3am kebab, {name1} and {name2} are wrapped up together.",
    threeWayTie: "Genesis. {name1}, {name2}, and {name3} are in deep.",
    noScore: "Dropped the ball. Kicked it out of bounds. Went home."
  },
  63: {
    update: "{leader} is looking good, leading by {margin}. {loser} is looking average.",
    twoWayTie: "Closer than a crowded train to the city. {name1} and {name2} are squashed.",
    threeWayTie: "The Police. {name1}, {name2}, and {name3} are sending an SOS.",
    noScore: "A total shambles. Someone check the wifi, surely you're not this bad?"
  },
  62: {
    update: "{leader} is stepping up, up by {margin}. {loser} is falling down.",
    twoWayTie: "The odd couple? Nah, the even couple. {name1} and {name2} are tied.",
    threeWayTie: "The Jam. {name1}, {name2}, and {name3} are going underground.",
    noScore: "Running on empty. The tank is dry."
  },
  61: {
    update: "{leader} is gaining momentum, leading by {margin}. {loser} is losing grip.",
    twoWayTie: "Like a servo pie and sauce, {name1} and {name2} belong together.",
    threeWayTie: "Cream. {name1}, {name2}, and {name3} rise to the top.",
    noScore: "Like a vegan at a Bunnings sausage sizzle. You found nothing here."
  },
  60: {
    update: "{leader} is making moves, up by {margin}. {loser} is standing still.",
    twoWayTie: "Holding hands across the finish line. {name1} and {name2} are cute.",
    threeWayTie: "Crosby, Stills and Nash. {name1}, {name2}, and {name3} are teaching your children well.",
    noScore: "Computer says no. Scoreboard says zero."
  },
  59: {
    update: "{leader} is focused, leading by {margin}. {loser} is distracted.",
    twoWayTie: "Nobody blink! {name1} and {name2} are in a staring contest.",
    threeWayTie: "Peter, Paul and Mary. {name1}, {name2}, and {name3} are leaving on a jet plane.",
    noScore: "Madness. Sheer madness. No points."
  },
  58: {
    update: "{leader} is finding the gaps, up by {margin}. {loser} is hitting the wall.",
    twoWayTie: "Drum roll... it's a tie! {name1} and {name2} both win (for now).",
    threeWayTie: "De La Soul. {name1}, {name2}, and {name3} is the magic number.",
    noScore: "Carry on like a pork chop all you want, you still got zero."
  },
  57: {
    update: "{leader} is sharp, leading by {margin}. {loser} is blunt.",
    twoWayTie: "Like gin and tonic, {name1} and {name2} are mixed together.",
    threeWayTie: "Beastie Boys. {name1}, {name2}, and {name3} fight for their right to party.",
    noScore: "Fumbling in the dark. No one found the light switch."
  },
  56: {
    update: "{leader} is keeping the foot down, up by {margin}. {loser} is out of gas.",
    twoWayTie: "It's a remix! {name1} featuring {name2} on the lead vocals.",
    threeWayTie: "Motörhead. {name1}, {name2}, and {name3} are the Ace of Spades.",
    noScore: "Shut the gate, the horse has bolted. And you all missed it."
  },
  55: {
    update: "{leader} is on a roll, leading by {margin}. {loser} is stuck in the mud.",
    twoWayTie: "Frozen in time! {name1} and {name2} are statues at the top.",
    threeWayTie: "ZZ Top. {name1}, {name2}, and {name3} have got legs.",
    noScore: "Goose egg! A giant zero for the squad."
  },
  54: {
    update: "{leader} is looking dangerous, up by {margin}. {loser} is looking scared.",
    twoWayTie: "Two heads are better than one? {name1} and {name2} are proving it.",
    threeWayTie: "Rush. {name1}, {name2}, and {name3} are in the limelight.",
    noScore: "Dead heat for last place. Everyone gets nothing."
  },
  53: {
    update: "{leader} is shifting gears, leading by {margin}. {loser} has stalled.",
    twoWayTie: "Tugging the rope! {name1} and {name2} are in a tug of war stalemate.",
    threeWayTie: "The Supremes. {name1}, {name2}, and {name3} keep me hangin' on.",
    noScore: "Playing funny buggers? Surely someone voted for this? No?"
  },
  52: {
    update: "{leader} is building a fortress, up by {margin}. {loser} is living in a tent.",
    twoWayTie: "Like a stunning mark, {name1} is on {name2}'s shoulders (or vice versa)!",
    threeWayTie: "TLC. {name1}, {name2}, and {name3} don't want no scrubs.",
    noScore: "As useful as a glass hammer. No points awarded."
  },
  51: {
    update: "{leader} is turning the screws, leading by {margin}. {loser} is coming loose.",
    twoWayTie: "It's a knot we can't untie! {name1} and {name2} are bound together.",
    threeWayTie: "Jonas Brothers. {name1}, {name2}, and {name3} are burning up.",
    noScore: "Did you all vote blindfolded? Zero marks."
  },
  50: {
    update: "HALFWAY MARK! {leader} is winning the marathon by {margin}. {loser} is wheezing.",
    twoWayTie: "Halfway split! {name1} and {name2} have to share the prize money.",
    threeWayTie: "Three strikes! {name1}, {name2}, and {name3} are out... in front!",
    noScore: "Whiff! The smell of failure is strong in here."
  },
  49: {
    update: "{leader} is tearing it up, up by {margin}. {loser} is in tatters.",
    twoWayTie: "Like a mullet, it's business at the front for both {name1} and {name2}.",
    threeWayTie: "Like a sandwich. {name2} is the filling between {name1} and {name3}.",
    noScore: "Wait for it... wait for it... Nope. No one got it."
  },
  48: {
    update: "{leader} is pure class, leading by {margin}. {loser} has no class.",
    twoWayTie: "Velcro! {name1} and {name2} are hooked on each other.",
    threeWayTie: "Ready, Set, Go! {name1}, {name2}, and {name3} are at the line.",
    noScore: "Stubby short of a six pack. That's this group right now."
  },
  47: {
    update: "{leader} is the captain now, up by {margin}. {loser} is swabbing the deck.",
    twoWayTie: "Stuck in the revolving door together. {name1} and {name2} are spinning.",
    threeWayTie: "Primary colours. {name1}, {name2}, and {name3} are mixing it up.",
    noScore: "You couldn't organise a chook raffle in a pub. No one picked the song."
  },
  46: {
    update: "{leader} is locked in, leading by {margin}. {loser} is locked out.",
    twoWayTie: "Buy one get one free! {name1} and {name2} are the special of the day.",
    threeWayTie: "Tic Tac Toe! {name1}, {name2}, and {name3} are three in a row.",
    noScore: "It's a desert out there. Not a drop of water or a point in sight."
  },
  45: {
    update: "{leader} is climbing high, up by {margin}. {loser} has vertigo.",
    twoWayTie: "Matching set! {name1} and {name2} are a two-for-one deal.",
    threeWayTie: "Like a totem pole. {name1}, {name2}, and {name3} are stacked.",
    noScore: "Flamin' galahs! The lot of ya!"
  },
  44: {
    update: "{leader} is making a statement, leading by {margin}. {loser} is speechless.",
    twoWayTie: "Twin turbos! {name1} and {name2} are revving at the same RPM.",
    threeWayTie: "Spiderbait! {name1}, {name2}, and {name3} are buying me a pony.",
    noScore: "Munted. The round is munted. No scores."
  },
  43: {
    update: "{leader} is surging, up by {margin}. {loser} is retreating.",
    twoWayTie: "Synchronised swimming! {name1} and {name2} are performing perfectly together.",
    threeWayTie: "Silverchair! (Before they broke up). {name1}, {name2}, and {name3} are waiting for tomorrow.",
    noScore: "Dropped the pie! You had it in your hands and you dropped it."
  },
  42: {
    update: "{leader} is firing lasers, leading by {margin}. {loser} is holding a water pistol.",
    twoWayTie: "No daylight! {name1} and {name2} are running in each other's shadows.",
    threeWayTie: "Blind Melon. {name1}, {name2}, and {name3} strictly no rain.",
    noScore: "Shocker! An absolute shocker from the gallery."
  },
  41: {
    update: "{leader} is hot property, up by {margin}. {loser} is a condemned building.",
    twoWayTie: "Like a postcode, they share the same numbers! {name1} and {name2} are level.",
    threeWayTie: "Three coins in the fountain. {name1}, {name2}, and {name3} are wishing for a win.",
    noScore: "Bog standard effort. Actually, below standard. Zero."
  },
  40: {
    update: "{leader} is pulling the strings, leading by {margin}. {loser} is a puppet.",
    twoWayTie: "Tenser than a grand final BBQ. {name1} and {name2} are tied.",
    threeWayTie: "Three sheets to the wind. {name1}, {name2}, and {name3} are loose.",
    noScore: "Total wipeout! Everyone fell off the surfboard."
  },
  39: {
    update: "{leader} is master of the domain, up by {margin}. {loser} is the servant.",
    twoWayTie: "Right down to the wire! {name1} and {name2} are sparking electricity.",
    threeWayTie: "Like the stumps at the cricket. {name1}, {name2}, and {name3} are standing together.",
    noScore: "Are your ears painted on? How did you miss this?"
  },
  38: {
    update: "{leader} is teaching a lesson, leading by {margin}. {loser} is in detention.",
    twoWayTie: "Peas in a pod. {name1} and {name2} have the exact same score.",
    threeWayTie: "Salt-N-Pepa (plus Spinderella). {name1}, {name2}, and {name3} are pushing it.",
    noScore: "The wheel is turning but the hamster is dead. No points."
  },
  37: {
    update: "{leader} is driving the bus, up by {margin}. {loser} missed the stop.",
    twoWayTie: "Like Kath and Kim, {name1} and {name2} are an iconic duo at the top.",
    threeWayTie: "Run-DMC. {name1}, {name2}, and {name3} are tricky.",
    noScore: "Useless. As useful as pockets in your underpants."
  },
  36: {
    update: "{leader} is looking very comfortable, leading by {margin}. {loser} is sweating bullets.",
    twoWayTie: "It's a draw! {name1} and {name2} are going to have to arm wrestle for it.",
    threeWayTie: "Like a fork in the road. {name1}, {name2}, and {name3} are branching out.",
    noScore: "Fair dinkum? No one? Not even a pity vote?"
  },
  35: {
    update: "Huge lead! {leader} is up by {margin}. {loser} needs a miracle.",
    twoWayTie: "Closer than the queues at Centrelink. {name1} and {name2} are side by side.",
    threeWayTie: "The Three Stooges. {name1}, {name2}, and {name3} are poking eyes out.",
    noScore: "Strike three! The whole group is out."
  },
  34: {
    update: "{leader} is piling on the pain, up by {margin}. {loser} is in agony.",
    twoWayTie: "Same same, but different names. {name1} and {name2} are tied.",
    threeWayTie: "A perfect triangle. {name1}, {name2}, and {name3} have acute angles.",
    noScore: "This song is popular, unlike you lot who currently have zero points."
  },
  33: {
    update: "{leader} is untouchable, leading by {margin}. {loser} is very touchable.",
    twoWayTie: "A distinct lack of social distancing between {name1} and {name2}.",
    threeWayTie: "Like a juggle! {name1}, {name2}, and {name3} are all in the air at once.",
    noScore: "Bum steer! You all went the wrong way."
  },
  32: {
    update: "{leader} is scorching the earth, up by {margin}. {loser} is burnt toast.",
    twoWayTie: "Two hands on the wheel! {name1} and {name2} are co-pilots right now.",
    threeWayTie: "Hanson! {name1}, {name2}, and {name3} are Mmm-bop-ing their way to the top.",
    noScore: "Flat chat... to nowhere. No one picked it."
  },
  31: {
    update: "Daylight second! {leader} leads by {margin}. {loser} is in the dark.",
    twoWayTie: "Stalemate! {name1} and {name2} have cancelled each other out.",
    threeWayTie: "The Three Tenors. {name1}, {name2}, and {name3} are hitting the high notes.",
    noScore: "Like a screen door on a submarine. That's how useful your votes were."
  },
  30: {
    update: "{leader} is running away with it, up by {margin}. {loser} is running on the spot.",
    twoWayTie: "Glued together! {name1} and {name2} are stuck fast.",
    threeWayTie: "Like a traffic light, {name1}, {name2}, and {name3} are stopping traffic.",
    noScore: "A few kangaroos loose in the top paddock for this group. Total miss."
  },
  29: {
    update: "{leader} is flexing hard, leading by {margin}. {loser} has pulled a hammy.",
    twoWayTie: "Like a pair of bonding undies, {name1} and {name2} are holding tight.",
    threeWayTie: "Gold, Frankincense, and Myrrh. {name1}, {name2}, and {name3} are wise men/women.",
    noScore: "Not the sharpest tools in the shed today, are we? 0 points."
  },
  28: {
    update: "{leader} is in a league of their own, up by {margin}. {loser} is playing Sunday league.",
    twoWayTie: "Super Over required! {name1} and {name2} finish the innings level.",
    threeWayTie: "A tricycle race! {name1}, {name2}, and {name3} are pedalling hard.",
    noScore: "Lost in the desert. Your votes are wandering around the Nullarbor."
  },
  27: {
    update: "No mercy! {leader} is crushing it by {margin}. {loser} is begging for it to stop.",
    twoWayTie: "Copycats! {name1} and {name2} are mimicking each other's every move.",
    threeWayTie: "Snap, Crackle, and Pop! {name1}, {name2}, and {name3} are making noise.",
    noScore: "Clean sheet! But in the bad way. No one marked the scorecard."
  },
  26: {
    update: "{leader} is hammering the nail in the coffin, leading by {margin}. {loser} is in the box.",
    twoWayTie: "Double trouble at the top! {name1} and {name2} are sharing the glory.",
    threeWayTie: "Ghostbusters! (The original ones minus Winston). {name1}, {name2}, and {name3} are catching ghosts.",
    noScore: "Does anyone here actually listen to music? No one? Okay."
  },
  25: {
    update: "Three quarters done! {leader} is looking elite, up by {margin}. {loser} is looking tragic.",
    twoWayTie: "It's a tandem bike ride! {name1} and {name2} are pedalling together.",
    threeWayTie: "Like a clover leaf. {name1}, {name2}, and {name3} are the lucky trio.",
    noScore: "You're all playing for sheep stations and you just lost the sheep."
  },
  24: {
    update: "{leader} is extending the gap, now up by {margin}. {loser} is fading away.",
    twoWayTie: "No leader declared! {name1} and {name2} are stuck in traffic together.",
    threeWayTie: "Green Day! {name1}, {name2}, and {name3} are an American Idiot sandwich.",
    noScore: "That went down like a lead balloon. No takers."
  },
  23: {
    update: "One way traffic! {leader} leads by {margin}. {loser} is going the wrong way down a one-way street.",
    twoWayTie: "Locked horns! {name1} and {name2} are two bulls in the same paddock.",
    threeWayTie: "Nirvana! {name1}, {name2}, and {name3} smell like teen spirit.",
    noScore: "Quieter than a library on Christmas Day. Zip. Zilch. Zero."
  },
  22: {
    update: "{leader} is putting the champagne on ice, leading by {margin}. {loser} is drinking warm tap water.",
    twoWayTie: "Even Stevens! {name1} and {name2} are balancing the scales.",
    threeWayTie: "Tighter than three people in a two-man tent. {name1}, {name2}, and {name3} are cozy.",
    noScore: "You lot couldn't pick a winner in a one-horse race."
  },
  21: {
    update: "Can anyone catch them? {leader} is flying, up by {margin}. {loser} is grounded.",
    twoWayTie: "Like two seagulls fighting over the last chip. {name1} and {name2} are at it!",
    threeWayTie: "A tripod of talent! {name1}, {name2}, and {name3} are holding the table up.",
    noScore: "Lights are on but no one's home. Complete blackout on the scoreboard."
  },
  20: {
    update: "Into the business end! {leader} is bossing it by {margin}. {loser} is getting fired.",
    twoWayTie: "Deadset deadlock! {name1} and {name2} are refusing to budge.",
    threeWayTie: "The Three Musketeers! All for one and one for all for {name1}, {name2}, and {name3}.",
    noScore: "Tougher than a $2 steak. No one could chew through this one."
  },
  19: {
    update: "{leader} is writing their acceptance speech, up by {margin}. {loser} is writing their will.",
    twoWayTie: "Get the saw, we're cutting the trophy in half! {name1} and {name2} are tied.",
    threeWayTie: "Three blind mice! {name1}, {name2}, and {name3} have no idea who is actually winning.",
    noScore: "Yeah, nah. Everyone voted nah. The song voted yeah."
  },
  18: {
    update: "{leader} smells blood, leading by {margin}. {loser} is the wounded gazelle.",
    twoWayTie: "Collision course! {name1} and {name2} have crashed into each other at the top.",
    threeWayTie: "Blink-182! {name1}, {name2}, and {name3} are asking 'What's my age again?'",
    noScore: "More useless than an ashtray on a motorbike. No one scored."
  },
  17: {
    update: "Total control. {leader} is cruising to victory by {margin}. {loser} is sinking fast.",
    twoWayTie: "Separated at birth? {name1} and {name2} are on the exact same wavelength.",
    threeWayTie: "Charlie's Angels! {name1}, {name2}, and {name3} are ready for action.",
    noScore: "Stone the crows! A collective fail. 0 points."
  },
  16: {
    update: "This is a massacre. {leader} leads by {margin}. {loser} needs a medic.",
    twoWayTie: "Mirror image! {name1} and {name2} are scoring identically.",
    threeWayTie: "Harry, Ron, and Hermione! {name1}, {name2}, and {name3} are pure magic.",
    noScore: "Gone walkabout! The points have disappeared into the bush."
  },
  15: {
    update: "Look at the scoreboard! {leader} is miles in front ({margin} points). {loser} is not even in the frame.",
    twoWayTie: "It's a dual monarchy! {name1} and {name2} are sharing the throne.",
    threeWayTie: "Cerberus! The three-headed dog of victory is {name1}, {name2}, and {name3}.",
    noScore: "You bunch of Galahs! How did everyone miss this?"
  },
  14: {
    update: "Dominance! {leader} is lapping the field, up by {margin}. {loser} has a flat tyre.",
    twoWayTie: "Nothing in it! {name1} and {name2} are trading blows like Rocky and Apollo.",
    threeWayTie: "Rock, Paper, Scissors! {name1}, {name2}, and {name3} are stuck in a loop.",
    noScore: "A pub with no beer. That's what this round feels like. Disappointing."
  },
  13: {
    update: "It's a procession! {leader} is waving to the crowd, up by {margin}. {loser} is being booed.",
    twoWayTie: "Tighter than a fishes arse! {name1} and {name2} cannot be separated.",
    threeWayTie: "Like a Neapolitan ice cream: {name1}, {name2}, and {name3} are three flavours of winning.",
    noScore: "Woop Woop! That's where your points are. Nowhere near here."
  },
  12: {
    update: "Final stages now. {leader} has one hand on the trophy, up by {margin}. {loser} has given up hope.",
    twoWayTie: "Flip a coin! {name1} and {name2} are perfectly matched.",
    threeWayTie: "Traffic jam! {name1}, {name2}, and {name3} are bumper to bumper on the freeway.",
    noScore: "Not happy Jan! The scoreboard remains unchanged."
  },
  11: {
    update: "Approaching the finish line and {leader} is unstoppable, leading by {margin}. {loser} has collapsed.",
    twoWayTie: "It's a standoff! {name1} and {name2} are staring each other down at high noon.",
    threeWayTie: "Huey, Dewey, and Louie! {name1}, {name2}, and {name3} are quacking the same tune.",
    noScore: "Out on the full! A collective shank from the whole team."
  },
  10: {
    update: "Result declared! {leader} takes the chocolates by {margin}. {loser} gets the empty wrapper.",
    twoWayTie: "You couldn't slide a cigarette paper between them. {name1} and {name2} are tied!",
    threeWayTie: "Destiny's Child! {name1}, {name2}, and {name3} are survivors.",
    noScore: "Straight through to the keeper. No one got a bat on it."
  },
  9: {
    update: "Crown them! {leader} is the monarch, winning by {margin}. {loser} is the court jester.",
    twoWayTie: "Closer than a coat of paint! {name1} and {name2} are completely deadlocked.",
    threeWayTie: "Bermuda Triangle! {name1}, {name2}, and {name3} are lost in the lead together.",
    noScore: "Empty Esky! You've opened the lid and there is nothing inside. Zero points."
  },
  8: {
    update: "The dust has settled. {leader} stands tall, winning by {margin}. {loser} is buried in the rubble.",
    twoWayTie: "Shoulder to shoulder! {name1} and {name2} are fighting over the steering wheel.",
    threeWayTie: "The Good, The Bad, and The Ugly. I won't say which is which, but {name1}, {name2}, and {name3} are tied.",
    noScore: "Stitched up! The entire group missed the boat on this one."
  },
  7: {
    update: "Victory! {leader} brings it home by {margin}. {loser} is walking home in the rain.",
    twoWayTie: "Golden Point time! {name1} and {name2} are level. Next vote wins!",
    threeWayTie: "Hat-trick! {name1}, {name2}, and {name3} have scored perfectly equal points.",
    noScore: "Tell 'em they're dreamin'! No one saw this coming."
  },
  6: {
    update: "It's all over bar the shouting! {leader} wins by {margin}. {loser} is asking for a recount.",
    twoWayTie: "It's the 2010 Grand Final all over again! It's a draw between {name1} and {name2}!",
    threeWayTie: "Three's a crowd? Not for {name1}, {name2}, and {name3}. They're loving it.",
    noScore: "Buckley's Chance! That's what you all had of picking this one."
  },
  5: {
    update: "We have a result! {leader} is the alpha, winning by {margin}. {loser} is the beta.",
    twoWayTie: "TIE GAME! {name1} and {name2} are neck and neck coming down the straight!",
    threeWayTie: "The Bee Gees of the scorecard! {name1}, {name2}, and {name3} are stayin' alive together.",
    noScore: "Dryer than a dead dingo's donger. Not a single point scored."
  },
  4: {
    update: "The fat lady has sung! {leader} reigns supreme by {margin}. {loser} should delete the app immediately.",
    twoWayTie: "We can't split them! {name1} and {name2} are stuck together like two dogs in a park.",
    threeWayTie: "TRIPLE THREAT! {name1}, {name2}, and {name3} are dancing in perfect sync.",
    noScore: "A Golden Duck for the squad! You're all walking back to the pavilion with your heads down."
  },
  3: {
    update: "Stop the count, it's done! {leader} takes the gold by {margin}. {loser} is crying into their beer.",
    twoWayTie: "It's a hung parliament! {name1} and {name2} need to form a coalition immediately.",
    threeWayTie: "Crowded house! {name1}, {name2}, and {name3} are all squashed into first place.",
    noScore: "Crickets... absolute silence. No one picked this banger."
  },
  2: {
    update: "And that's a wrap! {leader} finishes on top, winning by {margin}. {loser} is officially the biggest loser.",
    twoWayTie: "PHOTO FINISH! Call the judges! {name1} and {name2} are locked together on the same score!",
    threeWayTie: "It's a Ménage à trois! {name1}, {name2}, and {name3} are getting cozy at the top.",
    noScore: "Donut! A big fat zero for everyone. You lot are hopeless."
  },
  1: {
    update: "GAME OVER! {leader} is the Fairest 100 Champion! They smashed it by {margin} points. {loser} collects the Wooden Spoon!",
    twoWayTie: "DEAD HEAT! We have a tie at the top! {name1} and {name2} are absolutely inseparable!",
    threeWayTie: "MEXICAN STANDOFF! {name1}, {name2}, and {name3} are all pointing guns at each other! No one move!",
    noScore: "Swing and a miss! The whole group goes out for a duck. No points."
  }
};

export function getPodiumQuip(
  countdownPosition: number,
  leaderName: string,
  loserName: string,
  margin: number,
  tiedNames?: string[]
): string {
  const quipSet = podiumQuips[countdownPosition];

  if (!quipSet) {
    return ""; // No quip for this position
  }

  // Determine which quip to use based on leaderboard state
  let quip: string;

  // Check for ties FIRST (before checking for no-score state)
  if (tiedNames && tiedNames.length === 3) {
    // Three-way tie for first
    quip = quipSet.threeWayTie;
  } else if (tiedNames && tiedNames.length === 2) {
    // Two-way tie for first
    quip = quipSet.twoWayTie;
  } else if (!leaderName && !loserName && margin === 0) {
    // Everyone is at 0
    quip = quipSet.noScore;
  } else {
    // Normal update
    quip = quipSet.update;
  }

  // Replace placeholders
  quip = quip.replace(/{leader}/g, leaderName);
  quip = quip.replace(/{loser}/g, loserName);
  quip = quip.replace(/{margin}/g, margin.toString());

  if (tiedNames) {
    quip = quip.replace(/{name1}/g, tiedNames[0] || '');
    quip = quip.replace(/{name2}/g, tiedNames[1] || '');
    quip = quip.replace(/{name3}/g, tiedNames[2] || '');
  }

  return quip;
}
