import {RandomArray, FillArray} from "./modules/util.js";
import {NameToUriMap} from "./modules/nametourimap.js";
import {Point} from "./modules/point.js";
import {Spot} from "./modules/spot.js";
import {GameMap} from "./modules/gamemap.js";
import {GameMapViewControlModeTest, GameMapViewControlModePlacePiece, GameMapViewControlModeMoveCharacter} from "./modules/gamemapviewcontrolmode.js";
import {PlacePieceCard, MoveCard} from "./modules/card.js";
import {GameMapView} from "./modules/gamemapview.js";
import {Character} from "./modules/character.js";

const nameToUriMap = new NameToUriMap({
    "floor": "floor.svg",
    "wall": "wall.svg",
    "empty": "empty.svg",
    "blue": "blue-circle.svg",
    "red": "red-circle.svg",
});
const tileSize = 7;
const gameMap = new GameMap(
    new Point(tileSize * 6, tileSize * 4), undefined, new Point(3, 3));
gameMap.SetMapAt(new Point(tileSize * 0, tileSize * 0), new GameMap([
    "1111111",
    "1000001",
    "1000000",
    "1000000",
    "1000000",
    "1000001",
    "1100011",
    ], [Spot.Floor, Spot.Wall]));
gameMap.SetMapAt(new Point(tileSize * 5, tileSize * 3), new GameMap([
    "1100011",
    "1000001",
    "0000001",
    "0000001",
    "0000001",
    "1000001",
    "1111111",
    ], [Spot.Floor, Spot.Wall]));
gameMap.AddCharacter(new Character(gameMap, "blue"));
gameMap.AddCharacter(new Character(gameMap, "red"));

const gameMapView = new GameMapView(nameToUriMap, document.getElementById("map"));
gameMapView.SetGameMap(gameMap);
gameMapView.PushControlMode(new GameMapViewControlModeTest());

let cards = [
    new MoveCard(gameMapView, gameMap.GetCharacters()[0]),
    new PlacePieceCard(gameMapView, new GameMap([
        "       ",
        "1111111",
        "0000000",
        "0000000",
        "0000000",
        "1111111",
        "       ",
    ], [Spot.Floor, Spot.Wall])),
    new PlacePieceCard(gameMapView, new GameMap([
        "1100011",
        "1000001",
        "0000001",
        "0000001",
        "0000001",
        "1000001",
        "1111111",
    ], [Spot.Floor, Spot.Wall])),
    new PlacePieceCard(gameMapView, new GameMap([
        "0000001",
        "0000001",
        "0000001",
        "0000001",
        "0000001",
        "0000001",
        "1111111",
    ], [Spot.Floor, Spot.Wall])),
    new PlacePieceCard(gameMapView, new GameMap([
        " 10001 ",
        "1100011",
        "0000000",
        "0000000",
        "0000000",
        "1111111",
        "       ",
    ], [Spot.Floor, Spot.Wall])),
    new PlacePieceCard(gameMapView, new GameMap([
        "1100011",
        "1000001",
        "0000000",
        "0000000",
        "0000000",
        "1000001",
        "1100011",
    ], [Spot.Floor, Spot.Wall])),
];

document.getElementById("TestPlacePiece").addEventListener("click", () => {
    RandomArray(cards).Invoke();
});
document.getElementById("TestMove").addEventListener("click", () => {
    cards[0].Invoke();
});
