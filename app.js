const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//get players list
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT 
    *
    FROM 
    cricket_team 
    ;`;
  const playersList = await db.all(getPlayersQuery);
  response.send(
    playersList.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

//creating new player in the list
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  //console.log(playerDetails);
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
  INSERT INTO 
   cricket_team (player_name,jersey_number,role)
   VALUES (
       '${playerName}',
       ${jerseyNumber},
       '${role}'
   );
  `;
  const dbResponse = await db.run(addPlayerQuery);
  console.log(dbResponse);
  const player = dbResponse.lastID;
  console.log({ movieId: player });
  response.send("Player Added to Team");
});

//getting specific player
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayer = `
    SELECT * FROM cricket_team
    WHERE player_id = ${playerId};`;
  const player = await db.get(getPlayer);
  const finalPlayer = convertDbObjectToResponseObject(player);
  console.log(finalPlayer);
  response.send(finalPlayer);
});

//updating player
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;

  const updatePlayerQuery = `UPDATE
    cricket_team
  SET
    player_name = '${playerName}',
    jersey_number = ${jerseyNumber},
    role = '${role}'
  WHERE
    player_id = ${playerId};`;

  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//deleting a player
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteBookQuery = `
    DELETE FROM
    cricket_team
    WHERE
      player_id = ${playerId};`;
  await db.run(deleteBookQuery);
  response.send("Player Removed");
});

module.exports = app;
