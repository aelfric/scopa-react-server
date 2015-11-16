import {List, Map, fromJS} from 'immutable';
export function shuffle(state, deck){
    var array = deck.toArray();
    var i = 0
        , j = 0
        , temp = null;

    for (i = array.size - 1; i > 0; i -= 1){
        j = Math.floor(Math.random() * (i+1));
        temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    return state.set('deck', List(array));
}

export function newDeck(){
    var suits = ['clubs', 'coins', 'cups', 'swords'];
    var cards = ['1', '2', '3', '4', '5',
    '6', '7', 'woman', 'knight', 'king'];
    var deck = [];
    suits.map(function(suit){
        cards.map(function(card) {
          deck.push(card + ' of ' +  suit);
        });
    });

    return List(deck);
}

export function deal(state, numPlayers){
    var deck = state.get('deck');
    var players = [];

    var i,j;
    for (i = 0; i < numPlayers; i++){
        players.push({hand: []});
    }
    for (j = 0; j < (numPlayers * 3); j += numPlayers){
        for (i = 0; i < numPlayers; i++){
            players[i].hand.push(deck.get(j+i));
        }
    }

    return state.merge({
        players: fromJS(players),
        table: deck.skip(6).take(4),
        deck: deck.skip(10)
    });
};

export function discard(state, player, card){
    const table = state.get('table');

    const discardedCard = state.getIn(
            ['players', player, 'hand', card]);

    return state.removeIn(
            ['players', player, 'hand', card]
            ).merge({table: table.push(discardedCard)});
};

export function capture(state, player, playedCard, capturedCards){
    return state.withMutations( (state) => {
        var captured = state.getIn(
                ['player',player,'captured'],
                List());
        var table = state.get('table');
        captured = captured.push(
                state.getIn(['players', player, 'hand', playedCard]));
        state = state.removeIn(
                ['players', player, 'hand', playedCard]);

        captured = captured.withMutations( (list) => {
            table = table.filter( (el,index) => {
                if (capturedCards.indexOf(index) >= 0){
                    list.push(el);
                    return false;
                } else {
                    return true;
                }
            });
            return list;
        });
        state.updateIn(['players', player, 'captured'], 
                List(),
                list => list.merge(captured));
        state.set('table', table);
    });
};
