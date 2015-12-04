import mocha = require("mocha");
import redux = require('redux');

import { expect } from 'chai';

import * as tsr from '../src';

interface BottlesOfBeerOnTheWall {
	howMany: number;
	passedAround: boolean;
}

// A name to give to the specific action
const TAKE_ONE = 'Bottles/TAKE_ONE';

var beer: tsr.ActionInfo<BottlesOfBeerOnTheWall,void> =
  tsr.DefineAction<BottlesOfBeerOnTheWall,void>("Bottles/TAKE_ONE",
    (s: BottlesOfBeerOnTheWall, p: void) => {
      return {
        howMany: s.howMany-1,
        passedAround: true,
      }
    })

interface MaidsAMilking {
	howMany: number;
	cows: number;
}

var milk = tsr.DefineAction<MaidsAMilking,void>("Maids/ADD_MAID",
  (s: MaidsAMilking, p: void) => {
    return {
        howMany: s.howMany+1,
        cows: s.cows
    }
  })

interface Combined {
	bottles: BottlesOfBeerOnTheWall;
	maids: MaidsAMilking;
}

function CombinedReducer(bred: redux.Reducer<BottlesOfBeerOnTheWall>,
  mred: redux.Reducer<MaidsAMilking>): redux.Reducer<Combined> {
    return (s: Combined = {} as Combined, action: redux.Action) => {
      return {
        bottles: bred(s.bottles, action),
        maids: mred(s.maids, action),
      }
    }
  }
// An action re-targeted so it can be applied to an an instance
// Combined
//const takeOneDown2 = tsr.applyAt(["bottles"], takeOneDown)

interface Concurrent {
	bottles: Array<BottlesOfBeerOnTheWall>;
}

describe("Test eval actions", () => {
	it("should update different reducers independently when combined", () => {
		var b0 = {
			howMany: 99,
			passedAround: false
		};
		var m0 = {
			howMany: 7,
			cows: 14
		};

    var bred = tsr.EvalReducer(b0, [beer])
    var mred = tsr.EvalReducer(m0, [milk])
    var store = redux.createStore(CombinedReducer(bred, mred))

		store.dispatch(beer.create(null));

		expect(store.getState().bottles.howMany).to.equal(98);
    expect(store.getState().maids.howMany).to.equal(7);

    store.dispatch(milk.create(null));

    expect(store.getState().bottles.howMany).to.equal(98);
    expect(store.getState().maids.howMany).to.equal(8);
	})
  // I used to have an array based version here.  But in looking at
  // Abramov's Redux videos, he doesn't reuse actions between scalar and
  // vector types.  Instead, he defines different actions for those cases.
  // The key thing is that the actor can determine by looking at the state
  // if it applies to that state.  In other words, each element in an
  // array should have some kind of index/id associated with it so the
  // reducer/action know if they should do anything to that element.  They
  // have no notion of the container context.  As such, I'm not going to
  // worry about this functionality for now.
})
