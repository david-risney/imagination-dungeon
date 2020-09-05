import {RandomArray, FillArray} from "./modules/util.js";
import {NameToUriMap} from "./modules/nametourimap.js";
import {Point} from "./modules/point.js";
import {Spot} from "./modules/spot.js";
import {GameMap} from "./modules/gamemap.js";
import {GameMapViewControlModeTest, GameMapViewControlModePlacePiece} from "./modules/gamemapviewcontrolmode.js";
import {PlacePieceCard} from "./modules/card.js";
import {GameMapView} from "./modules/gamemapview.js";

const nameToUriMap = new NameToUriMap({
    "floor": "floor.svg",
    "wall": "wall.svg",
    "empty": "empty.svg",
});
const gameMap = new GameMap(new Point(30, 30));
gameMap.SetMapAt(new Point(12, 12), new GameMap([
    "11011",
    "10001",
    "00000",
    "10001",
    "11011",
    ], [Spot.Floor, Spot.Wall]));
const gameMapView = new GameMapView(nameToUriMap, document.getElementById("map"));
gameMapView.SetGameMap(gameMap);
gameMapView.PushControlMode(new GameMapViewControlModeTest());

let cards = [
    new PlacePieceCard(gameMapView, new GameMap([
        "11111",
        "00000",
        "11111",
    ], [Spot.Floor, Spot.Wall])),
    new PlacePieceCard(gameMapView, new GameMap([
        " 101",
        "1101",
        "0001",
        "1111",
    ], [Spot.Floor, Spot.Wall])),
    new PlacePieceCard(gameMapView, new GameMap([
        " 101 ",
        "11011",
        "00000",
        "11111",
    ], [Spot.Floor, Spot.Wall])),
    new PlacePieceCard(gameMapView, new GameMap([
        "11011",
        "10001",
        "00000",
        "10001",
        "11011",
    ], [Spot.Floor, Spot.Wall])),
];

document.getElementById("TestPlacePiece").addEventListener("click", () => {
    RandomArray(cards).Invoke();
});