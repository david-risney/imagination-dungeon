import {Point} from "./modules/point.js";
import {Spot} from "./modules/spot.js";

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

    _PointToId(point) { return this._prefix + "_" + point.X + "_" + point.Y; }
    _IdToPoint(id) {
        const parts = id.split("_");
        if (parts[0] != this._prefix) {
            throw new Error("Trying to parse spot ID from different view...");
        }
        return new Point(parseInt(parts[1]), parseInt(parts[2]));
    }

    _UpdatePoint(point) {
        let spotElement = document.getElementById(this._PointToId(point));
        if (!spotElement) {
            spotElement = document.createElement("img");
            spotElement.setAttribute("id", this._PointToId(point));
            spotElement.classList.add("borderless");
            spotElement.classList.add("spot");

            const spotSize = 32;
            spotElement.style.width = spotSize + "px";
            spotElement.style.height = spotSize + "px";
            spotElement.style.position = "absolute";
            spotElement.style.left = spotSize * point.X;
            spotElement.style.top = spotSize * point.Y;

            spotElement.addEventListener("mouseout", this._SpotMouseOut.bind(this));
            spotElement.addEventListener("mouseover", this._SpotMouseOver.bind(this));
            spotElement.addEventListener("click", this._SpotClick.bind(this));
            spotElement.addEventListener("contextmenu", this._SpotRightClick.bind(this));

            this.ViewElement.appendChild(spotElement);
        }

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
}

export {GameMapView};