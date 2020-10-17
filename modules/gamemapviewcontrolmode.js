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

export {GameMapViewControlModeTest, GameMapViewControlModePlacePiece};