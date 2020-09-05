import {FillArray} from "./modules/util.js";
import {Point} from "./modules/point.js";
import {Spot} from "./modules/spot.js";

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

export {GameMap};