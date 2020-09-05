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

export {GameMapViewControlModeTest, GameMapViewControlModePlacePiece};