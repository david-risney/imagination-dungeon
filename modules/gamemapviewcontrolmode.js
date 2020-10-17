import {Point} from "./point.js";

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

    Move(view, direction) {
    }
}

class GameMapViewControlModePlacePiece {
    m_point;

    constructor() {
        this.m_point = new Point(0, 0);
    }

    PrimarySelect(view, point) {
        point = point || this.m_point;
        if (view.GameMap.SetMapAt(view._gameMapOverlayOffset, view.GameMapOverlay)) {
            view.PopControlMode();
        }
        return true;
    }

    SecondarySelect(view, point) {
        point = point || this.m_point;
        view.GameMapOverlay.Rotate();
        const max = view.GameMapOverlay.GetMax();
        const half = max.Scale(0.5, true);
        const offsetPoint = point.Add(half.Negate());
        let roundedPoint = offsetPoint.RoundTo(max.X);
        view.SetGameMapOverlayOffset(roundedPoint);
        // view.PopControlMode();
        // view.GameMapOverlay = null;
        // view.SetGameMapOverlayOffset(new Point(0, 0));
        return true;
    }

    Hover(view, point) {
        this.m_point = point;
        this._MoveView(view, point);
    }

    _MoveView(view, point) {
        const max = view.GameMapOverlay.GetMax();
        const half = max.Scale(0.5, true);
        const offsetPoint = point.Add(half.Negate());
        const roundedPoint = offsetPoint.RoundTo(max.X);

        view.SetGameMapOverlayOffset(roundedPoint);
    }

    ClearHover(view, point) {
    }

    Move(view, direction) {
        this.m_point = this.m_point.Add(direction.Scale(view.GameMapOverlay.GetMax().X));
        this._MoveView(view, this.m_point);
    }
}

class GameMapViewControlModeMoveCharacter {
    m_point;
    m_character;
    m_movementPoints = 0;

    constructor(character) {
        this.m_point = new Point(0, 0);
        this.m_character = character;
        this.m_movementPoints = this.m_character.GetCharacteristic("move");
    }

    PrimarySelect(view, point) {
        point = point || this.m_point;
        this._MoveCharacter(view, point);
        return true;
    }

    SecondarySelect(view, point) {
        return true;
    }

    Hover(view, point) {
    }

    ClearHover(view, point) {
    }

    Move(view, direction) {
        var point = this.m_character.m_location.Add(direction);
        this._MoveCharacter(view, point);
    }

    _MoveCharacter(view, point) {
        if (this.m_character.CanMoveTo(point)) {
            this.m_character.MoveTo(point);
            --this.m_movementPoints;
            view._UpdateAllCharacters();
        }
        if (this.m_movementPoints == 0) {
            view.PopControlMode();
        }

    }
}

export {GameMapViewControlModeTest, GameMapViewControlModePlacePiece, GameMapViewControlModeMoveCharacter};