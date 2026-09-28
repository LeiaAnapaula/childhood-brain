// Extracted from prototype/which-childhood-is-yours.html by scripts/extract-prototype.ts.
// SEEDS and REPERTOIRE are verbatim; base/country data was dropped on purpose (a childhood is parents + school + events).
export type Seed = { slug: string; name: string; text: string };
export type Childhood = { id: string; links: string[]; text: string };
export const SEEDS: { parents: Seed[]; schools: Seed[]; events: Seed[] } = {
  "parents": [
    {
      "slug": "provider",
      "name": "The Father as Order",
      "text": "Present through rules, money, and silence. Love was structure. You learned that being provided for and being seen are different things."
    },
    {
      "slug": "protector",
      "name": "The Devouring Mother",
      "text": "Love that held too tight. Every danger narrated, every step watched. You learned to carry their fear before you could carry your own."
    },
    {
      "slug": "golden",
      "name": "The Hero-Maker",
      "text": "You were their proof. Love arrived with achievement and left with failure. You became the family's myth and hid the child."
    },
    {
      "slug": "absent",
      "name": "The Absent God",
      "text": "Gone, or there and not there. You built an image to talk to. The image became more real than the person."
    },
    {
      "slug": "friend",
      "name": "The Eternal Child",
      "text": "A parent who never grew up. You heard adult secrets at nine and became the grown-up in the house."
    },
    {
      "slug": "striver",
      "name": "The Sacrificer",
      "text": "Everything given, nothing said. Debt was the family's language. You learned that love is measured in what it costs."
    },
    {
      "slug": "constant",
      "name": "The Great Mother",
      "text": "Nourishing, steady, unremarkable. Feelings had a place to land. You did not know it was rare until you left."
    },
    {
      "slug": "storm",
      "name": "The Shadow in the House",
      "text": "Moods no one named. You became a reader of doors and footsteps. Your intuition was born as a survival skill."
    }
  ],
  "schools": [
    {
      "slug": "public",
      "name": "The big public school",
      "text": "Buses, tests, a gifted track, and a lunch table that decided your rank."
    },
    {
      "slug": "religious",
      "name": "The small religious school",
      "text": "Uniforms, prayer, one teacher who knew your whole family. Shame and belonging arrived together."
    },
    {
      "slug": "underfunded",
      "name": "The underfunded school",
      "text": "Broken things, one great teacher who stayed, a library that closed early. You got sharp early."
    },
    {
      "slug": "elite",
      "name": "The elite school",
      "text": "Everyone's parent was someone. You learned what money sounds like when it is quiet."
    },
    {
      "slug": "village",
      "name": "The everyone-since-kindergarten school",
      "text": "Forty-minute ride, same faces for twelve years. Leaving was the plan or the sin."
    }
  ],
  "events": [
    {
      "slug": "seen",
      "name": "One adult saw you",
      "text": "A teacher, coach, or neighbor said one sentence you are still living up to."
    },
    {
      "slug": "responsibility",
      "name": "Early responsibility",
      "text": "You raised a sibling or ran the house before you were twelve."
    },
    {
      "slug": "move",
      "name": "The move",
      "text": "A city, a country, a language. You arrived as the new kid and never fully unpacked."
    },
    {
      "slug": "trait",
      "name": "Praise for one trait",
      "text": "Smart. Pretty. Strong. Funny. You became the trait and hid the rest."
    },
    {
      "slug": "rupture",
      "name": "The rupture",
      "text": "Divorce, a death, a departure. The house had a before and an after."
    },
    {
      "slug": "humiliation",
      "name": "Public humiliation",
      "text": "One moment in front of everyone. You decided something about visibility that day."
    },
    {
      "slug": "loved-alone",
      "name": "First thing you loved alone",
      "text": "A book, a game, a sky. Nobody gave it to you and nobody could take it."
    },
    {
      "slug": "money",
      "name": "Money went away",
      "text": "A layoff, a lost house, a quiet downgrade. You learned to notice prices."
    },
    {
      "slug": "secret",
      "name": "The secret",
      "text": "Something in the family nobody said out loud. You learned to hold what could not be held."
    },
    {
      "slug": "translator",
      "name": "Being the translator",
      "text": "Between languages, between parents, between worlds. You became the bridge."
    },
    {
      "slug": "win",
      "name": "The win",
      "text": "A trophy, a scholarship, a stage. For one day the family story was about you, and it was good."
    },
    {
      "slug": "illness",
      "name": "The illness",
      "text": "Yours or theirs. Waiting rooms. Learning that bodies can fail."
    },
    {
      "slug": "friend-left",
      "name": "The friend who left",
      "text": "The first person you chose who chose someone else."
    },
    {
      "slug": "forgiven",
      "name": "Caught and forgiven",
      "text": "You did the wrong thing, got caught, and were loved anyway. Repair became possible."
    },
    {
      "slug": "shamed",
      "name": "Caught and shamed",
      "text": "You did the wrong thing and it became who you were for a year. You learned to hide."
    },
    {
      "slug": "summer",
      "name": "The long summer alone",
      "text": "Weeks with no one home. You built a world to live in."
    },
    {
      "slug": "grandparent",
      "name": "The grandparent",
      "text": "One older person who had time. Their kitchen was the safest room in the world."
    },
    {
      "slug": "comparison",
      "name": "The comparison",
      "text": "A sibling or cousin who was the standard. You measured yourself in someone else's units."
    },
    {
      "slug": "first-no",
      "name": "The first no",
      "text": "You refused something everyone expected. It cost you and it made you."
    },
    {
      "slug": "needed",
      "name": "Being needed",
      "text": "Someone relied on you and you liked it more than you should have. Usefulness became love."
    }
  ]
};
export const REPERTOIRE: Childhood[] = [
  {
    "id": "childhood-001",
    "links": [
      "provider",
      "constant",
      "public",
      "trait",
      "win",
      "friend-left"
    ],
    "text": "The garage door was how you knew he was home. Your mother kept the calendar on the fridge and the peace in the house, and dinner happened whether or not anyone spoke. You were the smart one, which the neighbors said before you could spell it, so you stopped bringing home anything that was not an A. The science fair trophy sat on the counter for a week and your father touched it once, on his way past. In eighth grade your best friend found a louder table and did not look back. You still notice who saves you a seat."
  },
  {
    "id": "childhood-002",
    "links": [
      "storm",
      "absent",
      "underfunded",
      "responsibility",
      "seen",
      "summer"
    ],
    "text": "You learned the sound of his keys before you learned to read. When he left for good the apartment got quieter and you got older in a month: cereal for your brother, the lie to the landlord, homework at the laundromat. One teacher kept you after class once and said, you are going to be fine, and you decided to believe a stranger over your own house. The summers were long and empty and you filled them with a whole city you drew on the back of flyers. You still build places to live in when the real one is loud."
  },
  {
    "id": "childhood-003",
    "links": [
      "golden",
      "protector",
      "elite",
      "comparison",
      "humiliation",
      "first-no"
    ],
    "text": "Your mother introduced you by your test scores. Your father drove you to school with the doors locked and the news on, and every story ended with what could happen to a kid like you. Your cousin was the standard: earlier, taller, admitted first. In tenth grade you froze in the middle of a speech in front of the whole assembly and someone laughed, and you decided visibility was a thing that happened to other people. Senior year you turned down the school they had picked. Nobody spoke at dinner for a week. It was the first thing that was yours."
  },
  {
    "id": "childhood-004",
    "links": [
      "friend",
      "storm",
      "village",
      "secret",
      "loved-alone",
      "needed"
    ],
    "text": "Your mother told you about the divorce before she told your father. You were nine. The house had weather, and you learned to forecast it from the way the car door shut. Everyone at school had known you since kindergarten, which meant nobody could see that anything was wrong, which is what your family wanted. You found astronomy in the school library at eleven and the sky became the only thing in your life that did not need managing. Being needed was the closest thing to being loved, so you became very good at it."
  },
  {
    "id": "childhood-005",
    "links": [
      "striver",
      "constant",
      "religious",
      "translator",
      "money",
      "grandparent"
    ],
    "text": "Two languages, one at the kitchen table and one at the front door, and you were the door. You read the mortgage letters out loud at eight and translated the bad parts into something gentler. The school was small and the uniform was itchy and one nun knew your whole family, which was mostly a comfort. When the restaurant closed you learned what things cost by watching your mother's face at the register. Your grandmother's kitchen was two blocks away and smelled like cumin and had no problems in it. You still go somewhere small to feel safe."
  },
  {
    "id": "childhood-006",
    "links": [
      "striver",
      "constant",
      "public",
      "translator",
      "win",
      "grandparent"
    ],
    "text": "The combi stopped in front of the house before six and your father was already on it. Your mother packed two lunches and one was yours. School was concrete and noise and a teacher who taught forty of you with one chalk, and you were the one who explained the English homework to the others. When you won the district olympiad your abuela lit a candle and told the whole street. The kitchen in her house had a tin roof that sang in the rain and no bad news ever entered it. You are still translating one world to another and you still hear the roof."
  },
  {
    "id": "childhood-007",
    "links": [
      "provider",
      "storm",
      "religious",
      "comparison",
      "secret",
      "loved-alone"
    ],
    "text": "Your father owned the store and the store owned him. Your mother's moods decided what kind of night it would be, and you could tell from the sound of her heels in the corridor. At the colegio the nuns compared you to your sister out loud. There was something about your uncle nobody said and everyone knew, and you learned to hold it like a hot plate. On the roof at night with a borrowed book of constellations you found the first thing that belonged only to you. You still climb somewhere high when the house gets loud."
  },
  {
    "id": "childhood-008",
    "links": [
      "absent",
      "protector",
      "underfunded",
      "responsibility",
      "move",
      "seen"
    ],
    "text": "He went north for work and came back as a voice on Sundays. Your mother held your hand crossing every street until you were twelve and told you every story about a girl who was not careful. The school in Chosica had one good teacher, Señor Paredes, who told you once that you had a mind like a river, and you carried the sentence to Lima when the family moved and then further. You raised your brother in the afternoons while your mother sold at the market. You arrived everywhere as the new one. You still have not fully unpacked."
  },
  {
    "id": "childhood-009",
    "links": [
      "golden",
      "friend",
      "elite",
      "trait",
      "humiliation",
      "first-no"
    ],
    "text": "You were la inteligente before you were anything else, and your mother said it at every table. Your father talked to you about money and his marriage like you were his lawyer. At the private school in La Molina everyone's father was somebody and you learned what quiet money sounds like. In tercero you answered wrong in front of the whole class and the teacher let the silence run, and something in you decided to never be seen guessing again. At seventeen you said no to the career they had chosen. It cost you a year of dinners. It made you."
  },
  {
    "id": "childhood-010",
    "links": [
      "constant",
      "constant",
      "village",
      "forgiven",
      "illness",
      "needed"
    ],
    "text": "Both of your parents were home by seven and it did not seem like anything. The school was the same forty faces for twelve years and the whole neighborhood knew when you scraped your knee. When you broke the neighbor's window and lied about it, your father took you to apologize and then bought you an ice cream, and you learned that being caught was survivable. Your mother was sick the year you turned eleven and the house learned to need you. You liked it more than you should have. You still confuse being useful with being loved."
  },
  {
    "id": "childhood-011",
    "links": [
      "golden",
      "protector",
      "public",
      "trait",
      "comparison",
      "win"
    ],
    "text": "Your marks were announced at family dinners before the food. Your mother kept you home when it rained and told you what could happen to a child in the city. At the municipal school you were the topper and the class was sixty and the fan did not work. Your cousin in Pune was the measure of everything, and every phone call ended with his percentage. When you won the state olympiad your father called everyone he had ever met. For a day the family story was about you. You still confuse a good result with being loved."
  },
  {
    "id": "childhood-012",
    "links": [
      "striver",
      "constant",
      "underfunded",
      "translator",
      "money",
      "grandparent"
    ],
    "text": "Your father took the 7:04 local and came back on the 8:40. Your mother kept the house running on a number she never said out loud. The school had a broken gate and one teacher who stayed late for you. You filled out every English form for the family before you were ten. When the business failed you learned what prices meant from the way your mother touched vegetables at the market. Your dadi's kitchen was the one room with no arithmetic in it. You still go looking for rooms like that."
  },
  {
    "id": "childhood-013",
    "links": [
      "storm",
      "absent",
      "religious",
      "secret",
      "loved-alone",
      "summer"
    ],
    "text": "Your father's temper arrived before he did, and you learned to read the stairwell. Your mother was there the way a photograph is there. At the convent school everyone prayed in the same direction and the nuns knew your family's name and something else about it that nobody said. You found a chess book in a cupboard at ten and it was the first thing that was entirely yours. The summers were long and the flat was empty and you built whole tournaments in your head. You still go inside your own head when the room is loud."
  },
  {
    "id": "childhood-014",
    "links": [
      "friend",
      "provider",
      "elite",
      "humiliation",
      "friend-left",
      "first-no"
    ],
    "text": "Your mother told you about your father's debts before she told anyone else. You were nine and you understood the interest. He worked and paid and did not speak. At the international school every parent had a driver and you learned which cars meant which money. In eighth standard you were called out in assembly for something you did not do, and the not-doing did not matter. Your best friend chose the loud table. At seventeen you refused the engineering seat. Your father did not speak for a month. It was the first thing you owned."
  },
  {
    "id": "childhood-015",
    "links": [
      "protector",
      "constant",
      "village",
      "responsibility",
      "illness",
      "seen"
    ],
    "text": "Your mother held your wrist crossing every road and told you the news at bedtime as a warning. Your father came home at six with fruit. The school was a lane away and everyone had known you since you were three. When your grandfather got sick you were the one who slept at the hospital, twelve years old with a schoolbag. One teacher kept you back after class and said one sentence about your mind that you have not stopped trying to deserve. You still show up for the people who did not ask."
  },
  {
    "id": "childhood-016",
    "links": [
      "golden",
      "provider",
      "elite",
      "trait",
      "comparison",
      "humiliation"
    ],
    "text": "Your mother told the relatives your scores before they sat down. Your father left before you woke and came home after you slept and paid for everything, which was how he said it. At the key school everyone's parent was someone. Your cousin was the unit you were measured in. In the year you were eleven you read the wrong answer aloud in front of the whole class and the teacher let the silence do the work. You decided that day about being seen. You are still the smart one and you are still hiding the rest."
  },
  {
    "id": "childhood-017",
    "links": [
      "absent",
      "striver",
      "public",
      "grandparent",
      "translator",
      "first-no"
    ],
    "text": "Your parents worked in another city and came home for Spring Festival with gifts and jet lag. Your grandmother raised you in a two-room flat with a rice cooker that sang. The school was crowded and hot and you were the one who read the notices to the older neighbors. You explained your grandmother to your parents and your parents to your grandmother. At eighteen you refused the major they chose on the phone. Your grandmother said nothing and made your favorite soup. It is still the only room you feel safe in."
  },
  {
    "id": "childhood-018",
    "links": [
      "protector",
      "constant",
      "religious",
      "loved-alone",
      "secret",
      "win"
    ],
    "text": "Your mother knew the temperature of every room you would enter. Your father was steady and quiet and always there at dinner. At school there was a thing about your family's past that the teachers knew and nobody said. You found a shortwave radio in a drawer at nine and the voices from far away became the first thing that was only yours. When you won the provincial competition your mother cried and your father nodded and you understood the nod was a speech. You still listen for far-away voices when the room gets close."
  },
  {
    "id": "childhood-019",
    "links": [
      "storm",
      "friend",
      "underfunded",
      "responsibility",
      "money",
      "shamed"
    ],
    "text": "Your father's moods came up the stairwell ahead of him. Your mother told you about the money before she told him you knew. When the factory closed you were ten and you learned what a price was from her face at the market. The school had broken windows and one teacher who stayed. You did the shopping and the forms and your sister's hair. When you were caught cheating on a test you did not need to cheat on, it became your name for a year. You learned to hide well. You are still very good at it."
  },
  {
    "id": "childhood-020",
    "links": [
      "constant",
      "constant",
      "village",
      "forgiven",
      "friend-left",
      "needed"
    ],
    "text": "Dinner was at six and both of your parents were at it. The same forty faces from kindergarten to the gaokao. When you broke the neighbor's bicycle and lied, your father took you to say sorry and then bought dumplings, and you learned that being caught was survivable. The friend you chose in year four chose someone else in year seven. Your little brother needed you for everything and you liked it more than you should have. You still feel most loved when you are most useful."
  },
  {
    "id": "childhood-021",
    "links": [
      "striver",
      "constant",
      "public",
      "translator",
      "grandparent",
      "win"
    ],
    "text": "Your father left for the second job before you left for school. Your mother made the house run on a number she kept in her head. The primaria was loud and full and had one teacher with one piece of chalk, and you explained the English homework to the whole row. When you won the concurso your abuela told the entire colonia and lit a candle for the Virgen. Her kitchen smelled like epazote and had no problems in it. You still translate one world into another and you still look for that kitchen."
  },
  {
    "id": "childhood-022",
    "links": [
      "provider",
      "storm",
      "religious",
      "secret",
      "comparison",
      "loved-alone"
    ],
    "text": "Your father owned the taller and the taller owned him. Your mother's moods decided the weather at dinner and you could read them from her heels in the hallway. At the colegio the madres compared you to your sister in front of everyone. There was a thing about your uncle that the whole family knew and nobody said. On the azotea at night with a borrowed book of maps you found the first thing that belonged only to you. You still climb somewhere high when the house gets loud."
  },
  {
    "id": "childhood-023",
    "links": [
      "absent",
      "protector",
      "underfunded",
      "move",
      "responsibility",
      "seen"
    ],
    "text": "He went to the north for work and became a voice on Sundays. Your mother held your hand at every crossing until you were twelve and told you stories about girls who were not careful. The school in Iztapalapa had one teacher who told you once that you had a mind like a river, and you carried that sentence through the move to Coyoacán and further. You raised your brother in the afternoons while your mother sold at the tianguis. You arrived everywhere as the new one. You still have not fully unpacked."
  },
  {
    "id": "childhood-024",
    "links": [
      "golden",
      "friend",
      "elite",
      "trait",
      "humiliation",
      "first-no"
    ],
    "text": "You were la inteligente before you were anything else and your mother said it at every table. Your father talked to you about money and his marriage as if you were his accountant. At the private school in Las Lomas every father was somebody and you learned what quiet money sounds like. In secundaria you answered wrong in front of the whole class and the teacher let the silence run, and something in you decided to never be seen guessing again. At seventeen you refused the career they had chosen. It cost you a year of Sunday dinners. It made you."
  },
  {
    "id": "childhood-025",
    "links": [
      "constant",
      "friend",
      "village",
      "forgiven",
      "illness",
      "needed"
    ],
    "text": "Both of your parents were home by seven and it never seemed like anything. Your mother talked to you like a friend a little too early. The school was the same forty faces for twelve years and the whole colonia knew when you scraped your knee. When you broke the neighbor's window and lied, your father took you to apologize and then bought you a paleta, and you learned that being caught was survivable. Your mother got sick the year you turned eleven and the house learned to need you. You liked it more than you should have. You still confuse being useful with being loved."
  }
];
