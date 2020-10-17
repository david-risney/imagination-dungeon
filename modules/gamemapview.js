import {Point} from "./point.js";
import {Spot} from "./spot.js";

class GameMapView {
    ViewElement;
    GameMap;
    GameMapOverlay = null;
    _gameMapOverlayOffset = new Point(0, 0);
    GameMapViewControlMode;
    _controlModes = [];
    _defaultControlMode = null;
    _prefix;
    _nameToUriMap;
    _highlightDiv;

    _GetControlMode() {
        if (this._controlModes.length > 0) {
            return this._controlModes[this._controlModes.length - 1];
        } else {
            return this._defaultControlMode;
        }
    }
    PushControlMode(controlMode) {
        this._controlModes.push(controlMode);
    }
    PopControlMode() {
        this._controlModes.pop();
    }

    SetGameMapOverlayOffset(offset) {
        this._gameMapOverlayOffset = offset;
        this._UpdateAllPoints();
        this._UpdateAllCharacters();
    }

    constructor(nameToUriMap, viewElement) {
        this._nameToUriMap = nameToUriMap;
        this.ViewElement = viewElement;
        this._prefix = "" + Math.floor(Math.random() * 1000000000);

        this._highlightDiv = document.createElement("div");
        this._highlightDiv.classList.add("highlightInvisible");
        const spotSize = 32;
        this._highlightDiv.style.width = spotSize + "px";
        this._highlightDiv.style.height = spotSize + "px";
        this._highlightDiv.style.position = "absolute";
        this.ViewElement.appendChild(this._highlightDiv);
        document.body.addEventListener("keydown", this._KeyDown.bind(this));
    }

    _KeyDown(eventArgs) {
        let direction;
        switch (eventArgs.keyCode) {
            case 38:
                direction = Point.North;
                break;
            case 37:
                direction = Point.West;
                break;
            case 39:
                direction = Point.East;
                break;
            case 40:
                direction = Point.South;
                break;
            case 32:
                if (this._GetControlMode()) {
                    this._GetControlMode().PrimarySelect(this, null);
                }
                break;
            case 90:
                if (this._GetControlMode()) {
                    this._GetControlMode().SecondarySelect(this, null);
                }
                break;
        }
        if (direction) {
            this._Move(direction);
        }
    }

    SetGameMap(gameMap) {
        if (gameMap !== this.GameMap) {
            if (this.GameMap) {
                this.GameMap.removeEventListener("changed", this._GameMapChanged.bind(this));
            }
            this.GameMap = gameMap;
            Array.from(this.ViewElement.querySelectorAll(".spot")).forEach(spot => this.ViewElement.removeChild(spot));
            if (this.GameMap) {
                this.GameMap.addEventListener("changed", this._GameMapChanged.bind(this));
                this._UpdateAllPoints();
                this._UpdateAllCharacters();
            }
        }
    }

    HighlightPoint(point) {
        const spotSize = 32;
        this._highlightDiv.style.left = spotSize * point.X;
        this._highlightDiv.style.top = spotSize * point.Y;
        this._highlightDiv.classList.remove("highlightInvisible");
        this._highlightDiv.classList.add("highlightVisible");
    }

    ClearHighlight() {
        this._highlightDiv.classList.remove("highlightVisible");
        this._highlightDiv.classList.add("highlightInvisible");
    }

    _GameMapChanged(eventArgs) {
        this._UpdatePoint(eventArgs.detail.point);
    }

    _UpdateAllPoints() {
        const max = this.GameMap.GetMax();
        for (let y = 0; y < max.Y; ++y) {
            for (let x = 0; x < max.X; ++x) {
                this._UpdatePoint(new Point(x, y));
            }
        }
    }

    _UpdateAllCharacters() {
        this.GameMap.GetCharacters().forEach(character => this._UpdateCharacter(character));
    }

    _PointToId(point, kind) { 
        kind = kind || "p";
        return this._prefix + "_" + kind + "_" + point.X + "_" + point.Y;
    }

    _IdToPoint(id) {
        const parts = id.split("_");
        if (parts[0] != this._prefix) {
            throw new Error("Trying to parse spot ID from different view...");
        }
        if (parts[1] == "p") {
            return new Point(parseInt(parts[2]), parseInt(parts[3]));
        }
        else if (parts[1] == "c") {
            return this._IdToCharacter(id).m_location;
        }
        else {
            throw new Error("Trying to parse non-point ID as point ID");
        }
    }

    _IdToCharacter(id) {
        const parts = id.split("_");
        if (parts[0] != this._prefix) {
            throw new Error("Trying to parse spot ID from different view...");
        }
        if (parts[1] != "c") {
            throw new Error("Trying to parse non-character ID as character ID");
        }

        return this.GameMap.GetCharacters().filter(c => c.m_id == parts[2])[0]
    }

    _CharacterToId(character) {
        return this._prefix + "_" + "c" + "_" + character.m_id;
    }

    _GetOrCreateElement(id, isCharacter) {
        let spotElement = document.getElementById(id);
        if (!spotElement) {
            spotElement = document.createElement("img");
            spotElement.setAttribute("id", id);
            spotElement.classList.add("borderless");
            spotElement.classList.add("spot");
            if (isCharacter) {
                spotElement.classList.add("character");
            }

            const spotSize = 32;
            spotElement.style.width = spotSize + "px";
            spotElement.style.height = spotSize + "px";
            spotElement.style.position = "absolute";

            spotElement.addEventListener("mouseout", this._SpotMouseOut.bind(this));
            spotElement.addEventListener("mouseover", this._SpotMouseOver.bind(this));
            spotElement.addEventListener("click", this._SpotClick.bind(this));
            spotElement.addEventListener("contextmenu", this._SpotRightClick.bind(this));

            this.ViewElement.appendChild(spotElement);
        }
        return spotElement;
    }

    _UpdateCharacter(character) {
        const spotSize = 32;
        let spotElement = this._GetOrCreateElement(this._CharacterToId(character));
        spotElement.style.left = spotSize * character.m_location.X;
        spotElement.style.top = spotSize * character.m_location.Y;

        const uri = this._nameToUriMap.Map(character.m_imageName);
        if (spotElement.getAttribute("src") != uri) {
            spotElement.setAttribute("src", uri);
        }
    }

    _UpdatePoint(point) {
        const spotSize = 32;
        let spotElement = this._GetOrCreateElement(this._PointToId(point));
        spotElement.style.left = spotSize * point.X;
        spotElement.style.top = spotSize * point.Y;

        let spot = Spot.Empty;
        if (this.GameMapOverlay) {
            spot = this.GameMapOverlay.GetAt(point.Add(this._gameMapOverlayOffset.Negate()));
        }
        if (spot === Spot.Empty) {
            spot = this.GameMap.GetAt(point);
        }

        const uri = this._nameToUriMap.Map(spot.Name);
        if (spotElement.getAttribute("src") != uri) {
            spotElement.setAttribute("src", uri);
        }
    }

    _SpotMouseOut(eventArgs) {
        if (this._GetControlMode()) {
            const point = this._IdToPoint(eventArgs.currentTarget.id);
            this._GetControlMode().ClearHover(this, point);
        }
    }

    _SpotMouseOver(eventArgs) {
        if (this._GetControlMode()) {
            const point = this._IdToPoint(eventArgs.currentTarget.id);
            this._GetControlMode().Hover(this, point);
        }
    }

    _SpotClick(eventArgs) {
        if (this._GetControlMode()) {
            const point = this._IdToPoint(eventArgs.currentTarget.id);
            if (this._GetControlMode().PrimarySelect(this, point)) {
                eventArgs.preventDefault();
            }
        }
    }

    _SpotRightClick(eventArgs) {
        if (this._GetControlMode()) {
            const point = this._IdToPoint(eventArgs.currentTarget.id);
            if (this._GetControlMode().SecondarySelect(this, point)) {
                eventArgs.preventDefault();
            }
        }
    }

    _Move(direction) {
        if (this._GetControlMode()) {
            this._GetControlMode().Move(this, direction);
        }
    }
}

export {GameMapView};