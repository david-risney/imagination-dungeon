(() => {
    function RandomArray(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    function FillArray(length, getValueAtIndex) {
        let arr = [];
        for (let index = 0; index < length; ++index) {
            arr[index] = getValueAtIndex(index);
        }
        return arr;
    }

    class Point {
        X = 0;
        Y = 0;
        constructor(X, Y) {
            this.X = X;
            this.Y = Y;
        }

        Negate() {
            return this.Scale(-1);
        }

        Scale(scale, floor) {
            let x = this.X * scale;
            if (floor) {
                x = Math.floor(x);
            }
            let y = this.Y * scale;
            if (floor) {
                y = Math.floor(y);
            }
            return new Point(x, y);
        }

        Add(p) {
            return new Point(this.X + p.X, this.Y + p.Y);
        }

        Equals(p) {
            return this.X === p.X && this.Y === p.Y;
        }

        toString() {
            return "{ X: " + this.X + ", Y: " + this.Y + " }";
        }
    }
    Point.Zero = new Point(0, 0);

    class Spot {
        Traversable = false;
        Name = "";

        constructor(traversable, name) {
            this.Traversable = traversable;
            this.Name = name;
        }

        toString() {
            return "{Spot " + this.Name + "}";
        }
    }
    Spot.Empty = new Spot(false, "empty");
    Spot.Wall = new Spot(false, "wall");
    Spot.Floor = new Spot(true, "floor");

    class GameMap {
        m_points = null;

        m_eventTarget = new EventTarget();

        constructor(mapTextArrOrSize, spotKinds) {
            this.addEventListener = this.m_eventTarget.addEventListener.bind(this.m_eventTarget);
            this.removeEventListener = this.m_eventTarget.removeEventListener.bind(this.m_eventTarget);

            if (mapTextArrOrSize.X !== undefined) {
                let mapSize = mapTextArrOrSize;
                this.m_points = FillArray(mapSize.Y, indexY => FillArray(mapSize.X, indexX => Spot.Empty));
            } else {
                let mapTextArr = mapTextArrOrSize;
                this.m_points = FillArray(mapTextArr.length, indexY => FillArray(mapTextArr[0].length, indexX => Spot.Empty));
                for (let y = 0; y < mapTextArr.length; ++y) {
                    for (let x = 0; x < mapTextArr[y].length; ++x) {
                        let text = mapTextArr[y][x];
                        if (text !== " ") {
                            let idx = parseInt(text);
                            this.m_points[y][x] = spotKinds[idx];
                        }
                    }
                }
            }
        }

        Clone() {
            let clone = new GameMap(this.GetMax());
            clone.SetMapAt(new Point(0, 0), this);
            return clone;
        }

        InRange(point) {
            const max = this.GetMax();
            return (0 <= point.X && point.X < max.X) && 
                (0 <= point.Y && point.Y < max.Y);
        }

        GetAt(point) {
            let result = Spot.Empty;
            if (this.InRange(point)) {
                result = this.m_points[point.Y][point.X];
            }
            return result || Spot.Empty;
        }

        GetMax() {
            return new Point(this.m_points[0].length, this.m_points.length);
        }

        SetAt(point, spot) {
            if (this.InRange(point)) {
                this.m_points[point.Y][point.X] = spot;
                this.m_eventTarget.dispatchEvent(new CustomEvent("changed", {
                    detail: {
                        source: this,
                        point: point
                    }
                }));
            } else {
                throw new Error("GameMap.SetAt fails on " + point);
            }
        }

        SetMapAt(offset, childMap) {
            let applied = false;
            if (this._CanPlaceOverlay(offset, childMap)) {
                for (let y = 0; y < childMap.m_points.length; ++y) {
                    for (let x = 0; x < childMap.m_points[y].length; ++x) {
                        let childSpotPoint = new Point(x, y);
                        let childSpot = childMap.GetAt(childSpotPoint);
                        if (childSpot !== Spot.Empty) {
                            this.SetAt(childSpotPoint.Add(offset), childSpot);
                        }
                    }
                }
                applied = true;
            }
            return applied;
        }

        Rotate() {
            let oldPoints = this.m_points;
            this.m_points = FillArray(oldPoints[0].length, 
                indexX => FillArray(oldPoints.length, indexY => Spot.Empty));
            for (let y = 0; y < oldPoints.length; ++y) {
                for (let x = 0; x < oldPoints[y].length; ++x) {
                    this.m_points[x][y] = oldPoints[y][x];
                }
            }
        }

        _CanPlaceOverlay(overlayOffset, overlay) {
            let valid = true;

            for (let y = 0; y < this.GetMax().Y; ++y) {
                for (let x = 0; x < this.GetMax().X; ++x) {
                    let pos = new Point(x, y);
                    if (overlay.GetAt(pos.Add(overlayOffset).Negate()) !== Spot.Empty) {
                        valid = this.GetAt(pos) === Spot.Empty;
                    }
                }
            }

            return valid;
        }
    }

    class GameMapViewControlModeTest {
        PrimarySelect(view, point) {
            view.HighlightPoint(point);
            return true;
        }

        SecondarySelect(view, point) {
            view.ClearHighlight();
            return true;
        }

        Hover(view, point) {
        }

        ClearHover(view, point) {
        }
    }

    class GameMapViewControlModePlacePiece {
        PrimarySelect(view, point) {
            if (view.GameMap.SetMapAt(view._gameMapOverlayOffset, view.GameMapOverlay)) {
                view.PopControlMode();
            }
            return true;
        }

        SecondarySelect(view, point) {
            view.GameMapOverlay.Rotate();
            const half = view.GameMapOverlay.GetMax().Scale(0.5, true);
            view.SetGameMapOverlayOffset(point.Add(half.Negate()));
            // view.PopControlMode();
            // view.GameMapOverlay = null;
            // view.SetGameMapOverlayOffset(new Point(0, 0));
            return true;
        }

        Hover(view, point) {
            const half = view.GameMapOverlay.GetMax().Scale(0.5, true);
            view.SetGameMapOverlayOffset(point.Add(half.Negate()));
        }

        ClearHover(view, point) {
        }
    }

    class PlacePieceCard {
        m_gameMapView;
        m_piece;

        constructor(view, piece) {
            this.m_gameMapView = view;
            this.m_piece = piece;
        }

        Invoke() {
            this.m_gameMapView.GameMapOverlay = this.m_piece;
            this.m_gameMapView.SetGameMapOverlayOffset(new Point(0, 0));
            this.m_gameMapView.PushControlMode(new GameMapViewControlModePlacePiece());
        }

        Clone() {
            return new PlacePieceCard(this.m_gameMapView, m_piece.Clone());
        }
    }

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

    class NameToUriMap {
        _uriMap = {};
        constructor(uriMap) {
            this._uriMap = uriMap;
        }

        Map(name) {
            const relativeUri = this._uriMap[name];
            if (!relativeUri) {
                console.error("Failed to find name " + name + " in map.");
                throw new Error("Failed to find name " + name + " in map.");
            }
            const uri = "./images/" + relativeUri;

            return uri;
        }
    }

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
})();