import {Point} from "./modules/point.js";

class Character {
    constructor(gameMap, imageName) {
        this.m_location = new Point(0, 0);
        this.m_imageName = imageName;
        this.m_gameMap = gameMap;
    }

    m_location = null;
    m_imageName = null;
    m_gameMap = null;

    CanMoveTo(destination) {
        return this.m_location.DistanceTo(destination) <= 1 &&
            this.m_gameMap.GetAt(destination).Traversable;
    }

    MoveTo(destination) {
        if (this.CanMoveTo(destination)) {
            this.m_location = destination;
        }
    }

    SetLocation(destination) {
        this.m_location = destination;
    }
};

export {Character};