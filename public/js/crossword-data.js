// Mini crossword content (browser build). window.CROSSWORD_PUZZLES.
// All 10 crossings in every puzzle were verified against real English words
// before clues were written.
//
// Grid shape (shared by all puzzles here, like a real NYT Mini):
//   [ A1 A1 A1 A1  # ]
//   [ A2 A2 A2 A2 A2 ]
//   [ A3 A3 A3 A3 A3 ]
//   [ A4 A4 A4 A4 A4 ]
//   [  # A5 A5 A5 A5 ]
// Numbering: 1=A1/D1, 2=D2, 3=D3, 4=D4, 5=A2, 6=D5, 7=A3, 8=A4, 9=A5.

(function () {
  function grid(A1, A2, A3, A4, A5) {
    return [
      [A1[0], A1[1], A1[2], A1[3], null],
      [A2[0], A2[1], A2[2], A2[3], A2[4]],
      [A3[0], A3[1], A3[2], A3[3], A3[4]],
      [A4[0], A4[1], A4[2], A4[3], A4[4]],
      [null, A5[0], A5[1], A5[2], A5[3]],
    ];
  }

  window.CROSSWORD_PUZZLES = [
    // Day 0 (Sunday)
    {
      grid: grid('VIAL', 'ANGER', 'STAGE', 'TRIAL', 'ONLY'),
      clues: {
        '1across': 'Small glass bottle, as for medicine',
        '1down': 'Enormous',
        '2down': "Song's opening bars, informally",
        '3down': 'One more time',
        '4down': 'Permitted by law',
        '5across': 'Rage',
        '6down': 'Depend (on)',
        '7across': 'Where actors perform',
        '8across': 'Courtroom proceeding',
        '9across': 'Sole; just',
      },
    },
    // Day 1 (Monday)
    {
      grid: grid('EACH', 'ALLOW', 'STORE', 'TENSE', 'REED'),
      clues: {
        '1across': 'Apiece',
        '1down': 'Direction the sun rises from',
        '2down': 'Change, as a plan',
        '3down': 'Genetic duplicate',
        '4down': "Knight's chess piece, or a stable animal",
        '5across': 'Permit',
        '6down': 'Plant pulled up in weeding',
        '7across': 'Retail shop',
        '8across': 'On edge',
        '9across': "Marsh plant, or a musician's mouthpiece part",
      },
    },
    // Day 2 (Tuesday)
    {
      grid: grid('COST', 'AFTER', 'STONE', 'TERSE', 'NEED'),
      clues: {
        '1across': 'Price tag figure',
        '1down': "Movie's actors, collectively",
        '2down': 'Not rarely',
        '3down': 'Where to buy groceries',
        '4down': 'On edge',
        '5across': 'Following',
        '6down': 'Marsh plant used in some woodwind reeds',
        '7across': 'Pebble, essentially',
        '8across': 'Brief and to the point',
        '9across': 'Require',
      },
    },
    // Day 3 (Wednesday)
    {
      grid: grid('LOST', 'AFTER', 'STONE', 'TERSE', 'NEED'),
      clues: {
        '1across': 'Unable to find the way',
        '1down': 'Final; not first',
        '2down': 'Not rarely',
        '3down': 'Where to buy groceries',
        '4down': 'On edge',
        '5across': 'Following',
        '6down': 'Marsh plant used in some woodwind reeds',
        '7across': 'Pebble, essentially',
        '8across': 'Brief and to the point',
        '9across': 'Require',
      },
    },
    // Day 4 (Thursday)
    {
      grid: grid('MOST', 'AFTER', 'STORE', 'SENSE', 'NEED'),
      clues: {
        '1across': 'The majority of',
        '1down': 'Church service, or a measure of matter',
        '2down': 'Not rarely',
        '3down': 'Pebble, essentially',
        '4down': 'Brief and to the point',
        '5across': 'Following',
        '6down': 'Marsh plant used in some woodwind reeds',
        '7across': 'Where to buy groceries',
        '8across': 'Common ___ (basic judgment)',
        '9across': 'Require',
      },
    },
    // Day 5 (Friday)
    {
      grid: grid('PAST', 'OFTEN', 'STONE', 'TERSE', 'REED'),
      clues: {
        '1across': 'Bygone times',
        '1down': "Mail carrier's delivery",
        '2down': 'Following',
        '3down': 'Where to buy groceries',
        '4down': 'On edge',
        '5across': 'Frequently',
        '6down': 'Require',
        '7across': 'Pebble, essentially',
        '8across': 'Brief and to the point',
        '9across': 'Marsh plant used in some woodwind reeds',
      },
    },
    // Day 6 (Saturday)
    {
      grid: grid('PASS', 'OFTEN', 'STONE', 'TERSE', 'REED'),
      clues: {
        '1across': 'Get through, as an exam',
        '1down': "Mail carrier's delivery",
        '2down': 'Following',
        '3down': 'Where to buy groceries',
        '4down': 'Common ___ (basic judgment)',
        '5across': 'Frequently',
        '6down': 'Require',
        '7across': 'Pebble, essentially',
        '8across': 'Brief and to the point',
        '9across': 'Marsh plant used in some woodwind reeds',
      },
    },
  ];
})();
