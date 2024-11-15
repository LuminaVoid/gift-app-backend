import fs from "fs";

const USERS_COUNT = 1000;

const names = [
  "Florence Patel",
  "Parker Coleman",
  "Julia Olson",
  "Malachi Middleton",
  "Madalyn Oliver",
  "Karson Saunders",
  "Meadow Benton",
  "Jamal Chan",
  "Hattie Acosta",
  "Jensen Ahmed",
  "Jolie Little",
  "Lennox Marks",
  "Monica Page",
  "Pablo Rangel",
  "Gloria Flowers",
  "Saul Neal",
  "Talia Morrison",
  "Maximus Sharp",
  "Camryn Peters",
  "Patrick Davis",
  "Mia Castro",
  "Jasper O’Neill",
  "Kenna Owen",
  "Cannon Fletcher",
  "Anaya Ho",
  "Morgan Knapp",
  "Linda Cline",
  "Cullen George",
  "Adelyn Lindsey",
  "Jayson Gillespie",
  "Alianna Hernandez",
  "Mason Harrington",
  "Legacy Hale",
  "Ezequiel Stewart",
  "Maya Berger",
  "Byron Kim",
  "Gabriella Sullivan",
  "Evan Espinoza",
  "Lucille Miles",
  "Jared Yoder",
  "Emerie Blevins",
  "Avi Rush",
  "Maleah Faulkner",
  "Jabari Gentry",
  "Amelie Horton",
  "Garrett Bullock",
  "Winnie Goodman",
  "Philip Giles",
  "Bailee Marshall",
  "Kaiden Trejo",
  "Rosalyn Crosby",
  "Tristen Love",
  "Avianna Maxwell",
  "Eden Greer",
  "Reina Pham",
  "Russell Chen",
  "Valeria Barnett",
  "Stephen Johns",
  "Giovanna Hawkins",
  "Victor Glover",
  "Alessia Davila",
  "Grey Rowland",
  "Harleigh Felix",
  "Rodney Guzman",
  "Ashley Sutton",
  "Warren Herman",
  "Paulina Chambers",
  "Orion Brock",
  "Jada Ortiz",
  "Landon Nelson",
  "Everly Valencia",
  "Dax Burgess",
  "Emory Glenn",
  "Zaid Charles",
  "Jenna Mora",
  "Arturo Wolfe",
  "Hallie Golden",
  "Amias Stevens",
  "Katherine Valentine",
  "Demetrius Robertson",
  "Harmony Hampton",
  "Hank McBride",
  "Kelsey Stewart",
  "Nolan Cordova",
  "Florence Burnett",
  "Davis Powell",
  "Vivian Coleman",
  "Micah Christensen",
  "Carmen Bonilla",
  "Aden Stone",
  "Catalina Gordon",
  "Karter Soto",
  "Brynlee Salas",
  "Zaiden Lynn",
  "Samira Coleman",
  "Micah Hood",
  "Briana Blackburn",
  "Zahir Velez",
  "Megan Jefferson",
  "Raylan Freeman",
  "Norah Bentley",
  "Randy Richards",
  "Trinity Santana",
  "Mohamed Garner",
  "Jacqueline Trujillo",
  "Apollo Guevara",
  "Teresa Moran",
  "Tate Singh",
  "Vivienne Olsen",
  "Skyler Wang",
  "Kailani Arias",
  "Alec Snyder",
  "Callie Castillo",
  "Kai Santana",
  "Myra Wagner",
  "Enzo Quintana",
  "Kenia Rasmussen",
  "Will Golden",
  "Giuliana Edwards",
  "Adrian Mendoza",
  "Cora Novak",
  "Bishop Kent",
  "Jazmine Aguirre",
  "Andy Greer",
  "Reina Sweeney",
  "Nixon Pena",
  "Rachel Mercado",
  "Abram Tapia",
  "Michaela Fischer",
  "Leonidas Massey",
  "Clementine Richards",
  "Holden Harding",
  "Aniya Bender",
  "Zavier Salas",
  "Amber Solomon",
  "Musa Ramirez",
  "Grace Duarte",
  "Abdullah Ramirez",
  "Grace Bond",
  "Roger Yang",
  "Angelina Murphy",
  "Cameron Colon",
  "Remy Hood",
  "Brixton Glenn",
  "Blaire Williams",
  "Oliver Schmitt",
  "Queen Wang",
  "Cohen Moses",
  "Karter Woodward",
  "Jeremias Romero",
  "Eliza Stafford",
  "Alfredo Thornton",
  "Haisley Fisher",
  "Gael Hebert",
  "Kyleigh Walls",
  "Larry Rose",
  "Magnolia Lu",
  "Duncan Macias",
  "Adley Carroll",
  "Oscar Arnold",
  "Finley Hail",
  "Hector Maldonado",
  "Elaina Barnes",
  "Damian Becker",
  "Laura Medrano",
  "Arian Kim",
  "Gabriella Salgado",
  "Trace Webb",
  "Ariella Valenzuela",
  "Jamari McCarthy",
  "Kira Noble",
  "Idris Khan",
  "Mabel Berger",
  "Byron Jaramillo",
  "Guadalupe Austin",
  "Omar Waller",
  "Whitley Ponce",
  "Langston Galvan",
  "Dallas Reynolds",
  "Vincent Tucker",
  "Esther Huber",
  "Mac Christian",
  "Anahi Montes",
  "Darren Price",
  "Piper Eaton",
  "Leighton Schmidt",
  "Kimberly Foster",
  "Kayden Larsen",
  "Xiomara Durham",
  "Kellen Pineda",
  "Nola Harris",
  "Samuel Wall",
  "Jayda Perkins",
  "Kyrie Howard",
  "Sophie Hutchinson",
  "Korbin O’Connell",
  "Jillian Tran",
  "Braxton Moran",
  "Celeste Jacobson",
  "Legacy Pope",
  "Aurelia Kerr",
  "Louie Moran",
  "Celeste Duncan",
  "Avery Wilkins",
  "Amalia Chase",
  "Otis Sanford",
  "Emerald Powell",
  "Bennett Rosas",
  "Joelle Manning",
  "Seth Pena",
  "Rachel Bailey",
  "Axel Coleman",
  "Julia Duke",
  "Kalel Hughes",
  "Samantha Hayes",
  "Legend Lester",
  "Averi Morales",
  "Aaron Dawson",
  "Veronica Nicholson",
  "Rodrigo Walter",
  "Penny Lowery",
  "Jaxxon Robbins",
  "Stevie Hull",
  "Salem Lim",
  "Giavanna Calderon",
  "Oakley Lang",
  "Amirah Crane",
  "Fox Ellis",
  "Ayla Koch",
  "Salvador Hudson",
  "Kamila Park",
  "Daxton Glover",
  "Alessia Bonilla",
  "Aden Ellis",
  "Ayla Hill",
  "Isaac Reyna",
  "Luella Esquivel",
  "Bridger Watkins",
  "Lola Booth",
  "Chaim Carrillo",
  "Kaylani Foster",
  "Kayden Vargas",
  "Andrea Winters",
  "Deandre Mathews",
  "Sloan Rios",
  "Israel Robbins",
  "Stevie Gilmore",
  "Vihaan Escobar",
  "Erin Blankenship",
  "Ernesto Marshall",
  "Adalyn Garrett",
  "Kairo Duarte",
  "Kynlee Carr",
  "Kash Walter",
  "Penny Watkins",
  "Nash Quinn",
  "Heaven Stanley",
  "Manuel Morrison",
  "Rebecca Buchanan",
  "Enrique Franklin",
  "Angela Santiago",
  "Beckham Marsh",
  "Adelina Wu",
  "Kyson Macdonald",
  "Rosalia Mason",
  "Brandon Parrish",
  "Tiana Hanson",
  "Khalil Love",
  "Avianna Jacobs",
  "Bryan Esquivel",
  "Jaylee Glenn",
  "Zaid Norman",
  "Malani Hardy",
  "Jayceon Burgess",
  "Emory Rivera",
  "Charles Barton",
  "Danna Serrano",
  "Milan Newton",
  "Braelynn Buchanan",
  "Enrique Arias",
  "Aleah Terry",
  "Armani Steele",
  "Rylie Rodgers",
  "Mathias Hammond",
  "Holly Conley",
  "Marvin Wolf",
  "Jolene Colon",
  "Bruce Richards",
  "Trinity Valentine",
  "Demetrius Horn",
  "Avah Koch",
  "Salvador Meyers",
  "Leyla Hawkins",
  "Victor Bryant",
  "Parker Herman",
  "Juelz Marsh",
  "Adelina Moss",
  "Porter Potter",
  "Rory Norris",
  "Cairo May",
  "Adriana Sutton",
  "Warren Hale",
  "Brinley Magana",
  "Rey McIntosh",
  "Gwen Spears",
  "Ameer Richards",
  "Trinity Magana",
  "Rey Hensley",
  "Malaya Herring",
  "Henrik Booker",
  "Nataly Santana",
  "Mohamed Bush",
  "Everlee Decker",
  "Taylor Carson",
  "Nalani Molina",
  "Prince Lim",
  "Giavanna Hampton",
  "Hank Hunt",
  "Genevieve Miles",
  "Jared Graves",
  "Elle Carson",
  "Ares Jefferson",
  "Julieta Daugherty",
  "Turner Blair",
  "Frances Baxter",
  "Tomas Sullivan",
  "Melanie McCormick",
  "Jasiah O’Connell",
  "Jillian Stevenson",
  "Callan Williamson",
  "Catherine Ross",
  "Wesley Stark",
  "Kamilah Singleton",
  "Landyn Marsh",
  "Adelina Stout",
  "Callahan Burke",
  "Vera Patrick",
  "Derrick Hayes",
  "Iris Russell",
  "Weston Stokes",
  "Miranda Sanford",
  "Truett Cherry",
  "Nyomi House",
  "Yehuda Howard",
  "Sophie Luna",
  "Erick Kane",
  "Ellianna Berger",
  "Byron Ryan",
  "Morgan Wolf",
  "Jase Daniels",
  "Ember Conner",
  "Phillip Rosario",
  "Louisa Buchanan",
  "Enrique Peterson",
  "Caroline Singh",
  "Louis Cummings",
  "Nylah Buckley",
  "Aryan McClure",
  "Estella Mason",
  "Brandon Gentry",
  "Amelie Gentry",
  "Magnus Frederick",
  "Sariyah Rollins",
  "Wes Hardin",
  "Vada Moran",
  "Tate McCarthy",
  "Kira Durham",
  "Kellen Ellis",
  "Ayla Harrison",
  "Gavin Rogers",
  "Madelyn Ahmed",
  "Harry Barry",
  "Waverly Abbott",
  "Kohen Richmond",
  "Whitney Yates",
  "Braylon Gilmore",
  "Chanel Gutierrez",
  "Luca Bauer",
  "Haley Person",
  "Moses Davila",
  "Rayne Rowland",
  "Eliezer Travis",
  "Mazikee Gregory",
  "Travis Meyers",
  "Leyla Shepard",
  "Damari Glover",
  "Alessia Adams",
  "Hudson Wright",
  "Lily Dean",
  "Ronan Robbins",
  "Stevie Whitaker",
  "Keith Maynard",
  "Carolyn Mayo",
  "Jericho Castillo",
  "Eva Henderson",
  "Beau Fowler",
  "Lennon Schmidt",
  "Zayden Leonard",
  "Demi Jordan",
  "Sawyer Lucero",
  "Ila Barr",
  "Harley Stewart",
  "Maya Rios",
  "Israel Michael",
  "Aubriella Bean",
  "Mccoy Madden",
  "Violette Stout",
  "Callahan Mendez",
  "Londyn Caldwell",
  "Rylan Terry",
  "Wren Fisher",
  "Gael Quintana",
  "Kenia Richmond",
  "Mordechai Calhoun",
  "Thalia Parra",
  "Davion Hodges",
  "Eve Pitts",
  "Trey Jennings",
  "Palmer Pitts",
  "Trey Fletcher",
  "Anaya Christian",
  "Ledger Garza",
  "River Meadows",
  "Wayne Diaz",
  "Elena Hartman",
  "Baker Heath",
  "Amani Valdez",
  "Kyler Monroe",
  "Carly Fields",
  "Clayton Stanley",
  "Gracelyn Schneider",
  "Raymond Franklin",
  "Angela Nielsen",
  "Tru Cortes",
  "Lea Mendez",
  "Arthur Roth",
  "Elliot Bravo",
  "Genesis Hahn",
  "Fallon Baldwin",
  "Jaiden Wilcox",
  "Ashlyn Johnson",
  "Noah English",
  "Kelly Turner",
  "Joshua Jefferson",
  "Julieta Lynch",
  "Zane Stark",
  "Kamilah Davis",
  "Lucas Murillo",
  "Mikaela Grimes",
  "Harlan Hale",
  "Brinley Frye",
  "Franco Bowen",
  "Dream Alvarado",
  "Andres Garrett",
  "Tessa Page",
  "Pablo McClure",
  "Estella Williamson",
  "Emerson Gentry",
  "Amelie Hess",
  "Lawrence Brandt",
  "Loretta Reed",
  "Easton Edwards",
  "Ivy Beck",
  "Eduardo Best",
  "Lexie Burton",
  "Zander Schmidt",
  "Kimberly Woodard",
  "Westley Mendez",
  "Londyn Abbott",
  "Kohen Sherman",
  "Addilyn Buck",
  "Jon McCullough",
  "Hana Franklin",
  "Simon Roman",
  "Astrid Cannon",
  "Archie Dickson",
  "Emmalynn Patel",
  "Parker Rhodes",
  "Tatum Church",
  "Terrance Taylor",
  "Sofia Beil",
  "Ariel Stephens",
  "Millie McLaughlin",
  "Ibrahim Buchanan",
  "Maryam Friedman",
  "Darwin Zhang",
  "Sarai Morales",
  "Aaron Woodward",
  "Drew Bernard",
  "Jair Calhoun",
  "Thalia Ballard",
  "Kenzo Cunningham",
  "Marley Monroe",
  "Colby Mayer",
  "Ainhoa Calderon",
  "Oakley Leblanc",
  "Novalee Spence",
  "Cillian Meza",
  "Rosa Baxter",
  "Tomas Figueroa",
  "Lilith Proctor",
  "Vance Rush",
  "Maleah Gilmore",
  "Vihaan Gilbert",
  "Jocelyn Sims",
  "Brian Bates",
  "Madilyn Brooks",
  "Jordan Woodard",
  "Aubrie Sandoval",
  "Brantley Orr",
  "Alaiya Jacobson",
  "Legacy Santos",
  "Alana McFarland",
  "Dane Yoder",
  "Emerie Christensen",
  "Gregory Arellano",
  "Faye Acevedo",
  "Dakari Nielsen",
  "Vienna Berry",
  "Adonis Booth",
  "Zariyah Patel",
  "Parker Montes",
  "Roselyn Fuller",
  "Andre Lara",
  "Heidi Arellano",
  "Kellan Howe",
  "Persephone Maldonado",
  "Javier Christensen",
  "Carmen Flynn",
  "Kannon Nguyen",
  "Nova Velasquez",
  "Sullivan Hoover",
  "Virginia Orr",
  "Benicio Jones",
  "Sophia Elliott",
  "Blake Scott",
  "Aurora Blankenship",
  "Ernesto Mathews",
  "Sloan Burnett",
  "Davis Esparza",
  "Ramona Chandler",
  "Royal Wise",
  "Mira McCoy",
  "Jett McKay",
  "Leanna Evans",
  "Elias Huynh",
  "Oaklee Olsen",
  "Skyler Perry",
  "Clara Ruiz",
  "Austin Huber",
  "Raquel Paul",
  "Noel Middleton",
  "Madalyn Contreras",
  "Emilio Valdez",
  "Diana Moody",
  "Ryland Sims",
  "Lena Barnes",
  "Damian Le",
  "Myla Hale",
  "Ezequiel Stone",
  "Catalina Goodman",
  "Philip Orozco",
  "Renata Bruce",
  "Uriah Dickson",
  "Emmalynn Benjamin",
  "Kyro Alfaro",
  "Yasmin Barker",
  "Kade Knox",
  "Kallie Blake",
  "Zyaire Sheppard",
  "Veda Terrell",
  "Jaxen Dean",
  "Julianna Trejo",
  "Wesson Reid",
  "Charlee Kerr",
  "Louie Case",
  "Cleo Freeman",
  "Jayce Stephens",
  "Millie Phillips",
  "Andrew Rose",
  "Magnolia McBride",
  "Denver Monroe",
  "Carly Petersen",
  "Samson Harmon",
  "Maren Welch",
  "Hendrix Reese",
  "Rosemary McIntyre",
  "Eliseo Lewis",
  "Ellie Rollins",
  "Wes Short",
  "Cheyenne Warren",
  "Abel Woods",
  "Reese Michael",
  "Bronson Russell",
  "Raelynn Ramos",
  "Angel Chavez",
  "Nevaeh McClure",
  "Reese Peralta",
  "Malayah Rosas",
  "Remi Gordon",
  "Taylor Pugh",
  "Judson Norman",
  "Malani McFarland",
  "Dane Tang",
  "Belle Lee",
  "Jack Hodge",
  "Coraline Merritt",
  "Colten Morrison",
  "Rebecca Acevedo",
  "Dakari Barker",
  "Remington Faulkner",
  "Jabari Frazier",
  "Octavia Valdez",
  "Kyler Hendricks",
  "Dani Buckley",
  "Aryan Ochoa",
  "Luciana Lang",
  "Wells Dejesus",
  "Julissa House",
  "Yehuda Mitchell",
  "Willow House",
  "Yehuda Goodwin",
  "Shiloh Andersen",
  "Alistair Price",
  "Piper Blackwell",
  "Marcellus Weber",
  "Alayah Kane",
  "Brock Briggs",
  "Alia Solomon",
  "Musa Ho",
  "Calliope Hubbard",
  "Forrest Munoz",
  "Kehlani Bass",
  "Landen Phan",
  "Elsa Monroe",
  "Colby Wyatt",
  "Liberty Pineda",
  "Gerardo Cantu",
  "Galilea Park",
  "Daxton Mendez",
  "Londyn Reese",
  "Alijah Sutton",
  "Izabella Bush",
  "Tyson Jaramillo",
  "Guadalupe Kelly",
  "Cooper Keller",
  "Logan Stout",
  "Callahan Ballard",
  "Alejandra Sexton",
  "Mylo Preston",
  "Indie Hess",
  "Lawrence Spears",
  "Isabela Hancock",
  "Rex Ellison",
  "Raina Franklin",
  "Simon Moreno",
  "Mary Buck",
  "Jon Lam",
  "Karina Keller",
  "Nico Woods",
  "Reese Pennington",
  "Bobby Walters",
  "Samara O’Neal",
  "Eddie Boone",
  "Mariam Huang",
  "Ayaan Jenkins",
  "Rylee Larsen",
  "Brycen Rangel",
  "Gloria Lim",
  "Cal Richard",
  "Davina Waters",
  "Maximilian Clarke",
  "Kaitlyn Kerr",
  "Louie Norman",
  "Malani Buckley",
  "Aryan Butler",
  "Athena Orozco",
  "Keanu Case",
  "Cleo Jensen",
  "Cash Farmer",
  "Madelynn Farley",
  "Graysen West",
  "Remi Booker",
  "Dominik Garrett",
  "Tessa Clayton",
  "Boston Conley",
  "Salem Barrera",
  "Makai Morales",
  "Skylar Neal",
  "Kane Russo",
  "Tinsley Xiong",
  "Azrael Stone",
  "Catalina Atkinson",
  "Duke Keller",
  "Logan Hamilton",
  "Jason Christian",
  "Anahi Archer",
  "Ephraim Robinson",
  "Nora Newman",
  "Anderson Rowland",
  "Harleigh Randall",
  "Trenton Vargas",
  "Andrea Richard",
  "Ahmed Hoover",
  "Virginia Mosley",
  "Rayden Washington",
  "Valerie Orozco",
  "Keanu Ibarra",
  "Madilynn Kirk",
  "Alessandro Walter",
  "Penny Orr",
  "Benicio Mercado",
  "Mckinley Huynh",
  "Layton Coffey",
  "Paola Huerta",
  "Douglas McCarty",
  "Halo Mata",
  "Ray McFarland",
  "Annika Hutchinson",
  "Korbin Enriquez",
  "Nellie Leal",
  "Cedric Hampton",
  "Leona May",
  "Finley Burke",
  "Vera Meadows",
  "Wayne Holland",
  "Mariah Parsons",
  "Lewis Fuentes",
  "Madeleine Garza",
  "Judah Franco",
  "Charleigh Costa",
  "Kenji Huynh",
  "Oaklee Hunt",
  "Jesus Burke",
  "Vera Case",
  "Bentlee Weeks",
  "Karen Santana",
  "Mohamed Portillo",
  "Nathalie Stewart",
  "Nolan Morrow",
  "Reyna Daniel",
  "Grady Rowe",
  "Matilda Foster",
  "Kayden Franklin",
  "Angela Ortiz",
  "Landon Shaw",
  "Emersyn Best",
  "Harlem Frank",
  "Dior Todd",
  "Baylor Garrison",
  "Cadence Ray",
  "Arlo Vega",
  "Dakota Liu",
  "Pedro Decker",
  "Aleena Lyons",
  "Cyrus Rocha",
  "Emmie Guevara",
  "Tommy Myers",
  "Lydia Hammond",
  "Francis Noble",
  "Hunter Melendez",
  "Nikolas Macdonald",
  "Rosalia Webster",
  "Shawn Hughes",
  "Samantha Stewart",
  "Nolan Stokes",
  "Miranda Garner",
  "Sage Mullins",
  "Maliyah Glass",
  "Allan Harrell",
  "Kara McCall",
  "Kiaan Johnson",
  "Emma Frank",
  "Braylen Singleton",
  "Malaysia May",
  "Finley Shepherd",
  "Katalina Villegas",
  "Clyde Robbins",
  "Stevie Campbell",
  "Christopher Spears",
  "Isabela Kim",
  "Roman Yang",
  "Angelina Dickerson",
  "Flynn Powers",
  "Michelle McLean",
  "Crosby Xiong",
  "Amayah Liu",
  "Pedro Price",
  "Piper Wolfe",
  "Donovan Acevedo",
  "Ashlynn Lugo",
  "Santos Wise",
  "Mira Curtis",
  "Muhammad Greene",
  "Selena Bullock",
  "Ben Hardy",
  "Jessica Stout",
  "Callahan Meadows",
  "Pearl Vaughn",
  "Remy Deleon",
  "Gabrielle Pacheco",
  "Erik Horn",
  "Avah Suarez",
  "Soren Carlson",
  "Kali Newton",
  "Santino Esparza",
  "Ramona Caldwell",
  "Rylan Carroll",
  "Zara Hensley",
  "Layne Camacho",
  "Armani Hamilton",
  "Jason Simpson",
  "Anastasia Barber",
  "Solomon Lindsey",
  "Colette Gomez",
  "Isaiah Mack",
  "Nadia Pineda",
  "Gerardo Savage",
  "Louise Lloyd",
  "Zaire Pace",
  "Giana Bullock",
  "Ben Keller",
  "Logan Bond",
  "Roger Ballard",
  "Alejandra Ochoa",
  "Winston Vazquez",
  "Journee Rasmussen",
  "Will McKenzie",
  "Briar Miller",
  "Benjamin Singh",
  "Vivienne Hayden",
  "Leroy Lim",
  "Giavanna Wagner",
  "Enzo Gates",
  "Melina Rush",
  "Kaiser Leblanc",
  "Novalee Green",
  "Anthony Flynn",
  "Dorothy Woodward",
  "Jeremias Gates",
  "Melina Coffey",
  "Kody Johnston",
  "Laila Gutierrez",
  "Luca Houston",
  "Lylah Dyer",
  "Atreus Benitez",
  "Aliza Kirby",
  "Tony Keller",
  "Logan Butler",
  "Ryder Marquez",
  "Milani Delacruz",
  "Memphis Kent",
  "Jazmine Hall",
  "Thomas Best",
  "Lexie Maxwell",
  "Eden Fowler",
  "Lennon Gibbs",
  "Deacon Kramer",
  "Hanna Warner",
  "Jaxton Charles",
  "Jenna Singh",
  "Louis Humphrey",
  "Journi Moyer",
  "Ahmir Terrell",
  "Paityn Sparks",
  "Drake Nava",
  "Scout Pace",
  "Dior Horne",
  "Marlowe Fry",
  "Jacoby Sweeney",
  "Yara Gomez",
  "Isaiah Woodard",
  "Aubrie Benitez",
  "Justice Mayo",
  "Aarya Weeks",
  "Anders Townsend",
  "Azalea Terrell",
  "Jaxen Terry",
  "Wren Suarez",
  "Soren Murillo",
  "Mikaela Acevedo",
  "Dakari Compton",
  "Elina Murphy",
  "Cameron Larsen",
  "Xiomara Walter",
  "Lochlan Griffith",
  "Alicia Benson",
  "Desmond Harmon",
  "Maren Garrett",
  "Kairo Reyes",
  "Audrey Farmer",
  "Jamison Lang",
  "Amirah Dodson",
  "Seven Silva",
  "Lucia McConnell",
  "London Chambers",
  "Makayla Guzman",
  "Jude Murray",
  "Faith Avalos",
  "Coen Abbott",
  "Melany Dejesus",
  "Rio Zavala",
  "Liv Sierra",
  "Dayton Glover",
  "Alessia Rush",
  "Kaiser Barr",
  "Noemi Romero",
  "Bryson Parker",
  "Aubrey Stark",
  "Kristopher Drake",
  "Jayleen Lowe",
  "Julius Glass",
  "Clare Bryant",
  "Jonah Hunter",
  "Khloe Berger",
  "Byron Moses",
  "Karter Reeves",
  "Clark Melton",
  "Kamiyah Burgess",
  "Kolton Daugherty",
  "Magdalena Valenzuela",
  "Jamari Garner",
  "Jacqueline Larsen",
  "Brycen Salinas",
  "Royalty Thornton",
  "Malik Harris",
  "Penelope Robbins",
  "Finnegan Hobbs",
  "Lacey Gilbert",
  "Tobias Stephenson",
  "Khaleesi Osborne",
  "Augustus Moss",
  "Bianca Whitaker",
  "Keith Pugh",
  "Landry Wu",
  "Kyson Jennings",
  "Palmer Hubbard",
  "Forrest Tyler",
  "Helena Reynolds",
  "Vincent Vincent",
  "Allyson Estes",
  "Hakeem Harper",
  "Ana Stewart",
  "Nolan Rollins",
  "Araceli Fisher",
  "Gael Houston",
  "Lylah Schmitt",
  "Murphy Phillips",
  "Naomi Becker",
  "Lawson Dejesus",
  "Julissa Simon",
  "Zayne Nixon",
  "Deborah Stevens",
  "Zachary Roth",
  "Elliot Sawyer",
  "Jefferson Spence",
  "Aislinn Glass",
  "Allan Clark",
  "Chloe Marquez",
  "Malakai Singleton",
  "Malaysia Adams",
  "Hudson Sharp",
  "Camryn Mayer",
  "Yahir Brewer",
  "Thea Hale",
  "Ezequiel Gordon",
  "Taylor Morales",
  "Aaron Melton",
  "Kamiyah Tang",
  "Rogelio Chapman",
  "Zuri Raymond",
  "Maurice Good",
  "Nathalia Wilkinson",
  "Leonard Owen",
  "Mikayla Velez",
  "Kareem Cohen",
  "Destiny Miles",
  "Jared Tate",
  "Skye Deleon",
  "Nasir Quintana",
  "Kenia Bates",
  "Ellis Hendrix",
  "Zhuri Zimmerman",
  "Sergio Atkins",
  "Mina Craig",
  "Odin Peck",
  "Crystal Myers",
  "Adam Chan",
  "Hattie Walters",
  "Colson Ballard",
  "Alejandra Tran",
  "Braxton Kramer",
  "Hanna Mora",
  "Arturo Rasmussen",
  "Esperanza Proctor",
  "Vance Ramirez",
  "Grace Estes",
  "Hakeem Jarvis",
  "Elisabeth Burch",
  "Gerald Chung",
];

const profilePictures = names.map((n) => `${n.replaceAll(" ", "_")}.jpg`);

// Amount of gifts each user received. Power-law distribution
const userReceivedGifts = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
  2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
  2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
  2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
  2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
  2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3,
  3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
  3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
  3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
  4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6,
  6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 8, 8, 8, 8, 9,
  9, 9, 9, 10, 10, 10, 10, 11, 11, 12, 12, 12, 12, 13, 14, 15, 15, 16, 16, 16,
  17, 18, 19, 20, 20, 21, 21, 22, 24, 25, 25, 28, 29, 30, 31, 32, 32, 34, 35,
  35, 36, 39, 43, 54, 81, 92, 113, 113, 139, 165, 188, 220, 276, 279, 577, 585,
  599, 632, 650, 687, 756, 802, 950, 1000,
];

const GIFT_VARIANTS = [
  { name: "Delicious Cake", totalSupply: 500 },
  { name: "Green Start", totalSupply: 3000 },
  { name: "Blue Star", totalSupply: 5000 },
  { name: "Red Star", totalSupply: 10000 },
];

const fillDummyData = () => {
  if (
    names.length !== USERS_COUNT ||
    profilePictures.length !== USERS_COUNT ||
    userReceivedGifts.length !== USERS_COUNT
  ) {
    console.log("dummy date setup seems to be broken");
    return;
  }

  const users = names.map((name, i) => ({
    name: name,
    username: `gift_app_${name.replaceAll(" ", "_").toLowerCase()}`,
    profilePic: profilePictures[i],
    receivedGiftCount: userReceivedGifts[i],
    sendTo: [] as string[],
  }));

  const totalGiftsToReceive = users.reduce(
    (a, c) => a + c.receivedGiftCount,
    0
  );
  console.log("Preparing to fill DB with dummmy data.");
  console.log(`👤 Total users: ${users.length}`);
  console.log(`🎁 Total gifts to process: ${totalGiftsToReceive}`);

  const getNextCandidateIndex = (i: number, currentUserIdx: number): number => {
    const nextIdx = i + 1 !== users.length ? i + 1 : 0;
    return nextIdx === currentUserIdx
      ? getNextCandidateIndex(nextIdx, currentUserIdx)
      : nextIdx;
  };
  for (let [i, user] of users.entries()) {
    let fulfilledGifts = 0;
    let sendCandidateIndex = getNextCandidateIndex(i, i);
    while (fulfilledGifts < user.receivedGiftCount) {
      // Each use can give from 1 to 3 gifts to the same person
      const randGiftCount = Math.floor(Math.random() * 4);
      const leftToGive = user.receivedGiftCount - fulfilledGifts;
      const giftsFromThisUser = Math.min(randGiftCount, leftToGive);
      users[sendCandidateIndex].sendTo.push(
        ...Array(giftsFromThisUser).fill(user.username)
      );
      fulfilledGifts += giftsFromThisUser;
      sendCandidateIndex = getNextCandidateIndex(sendCandidateIndex, i);
    }
  }

  console.log("Sanity checks:");
  const sentGifts = users.reduce((acc, cur) => acc + cur.sendTo.length, 0);
  console.log(
    "Same number of sent and received gifts",
    sentGifts === totalGiftsToReceive ? "✅" : "🛑"
  );
  const nobodySelfSends = users.every((u) => !u.sendTo.includes(u.username));
  console.log(
    "Nobody sends gifts to themselves",
    nobodySelfSends ? "✅" : "🛑"
  );

  // 1. Create all users
  // 2. Create all variants
  // 3. Each user buys & sends
};

fillDummyData();
