import {Point} from "./point.js";

class Character {
    constructor(gameMap, imageName) {
        this.m_location = new Point(0, 0);
        this.m_imageName = imageName;
        this.m_gameMap = gameMap;
        this.m_id = ++Character.s_count;
    }

    m_location = null;
    m_imageName = null;
    m_gameMap = null;
    m_id = null;

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

    GetCharacteristic(name) {
        return 6;
    }
};
Character.s_count = 0;

export {Character};