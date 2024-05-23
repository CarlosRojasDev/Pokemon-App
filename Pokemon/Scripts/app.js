let TotalPokemons
let DataPokemon = []
let PokemonsDetails = []
let PokemonTypes = []
let FriendPokemons = []
let pokemons
const cardsPerPage = 30
const visibleButtons = 20

class newPokemon {
    constructor(data) {
        this.name = data.name;
        this.url = data.url;
    }

    async getData() {
        try {
            const response = await fetch(this.url);
            const pokemon = await response.json();

            this.id = pokemon.id;
            this.type = pokemon.types[0].type.name;
            this.weight = pokemon.weight;
            this.image1 = pokemon.sprites.other.home["front_default"];
            this.image2 = pokemon.sprites.other["official-artwork"]["front_default"];
            this.image3 = pokemon.sprites.other["official-artwork"]["front_shiny"];
            this.image4 = pokemon.sprites.other.dream_world["front_default"];
            this.image5 = pokemon.sprites.front_default;

            return this; // Returns current Pokemon
        } catch (error) {
            console.error('Error al obtener datos del Pokémon:', error);
            throw error;
        }
    }
}
function getPokemonImage(pokemon) {
    let image = null
    let count = 1
    do {        
        if (count == 1) {
            image = pokemon.image5
        } else if (count == 2) {
            image = pokemon.image4
        } else if (count == 3) {
            image = pokemon.image3
        } else if (count == 4) {
            image = pokemon.image2
        } else if (count == 5) {
            image = pokemon.image1
        } else {
            image = "https://upload.wikimedia.org/wikipedia/commons/d/d1/Image_not_available.png"
        }
        count++
    } while (image == null);
    return image
}
function getHD_PokemonImage(pokemon) {
    let image = null
    let count = 1
    do {
        if (count == 1) {
            image = pokemon.image1
        } else if (count == 2) {
            image = pokemon.image2
        } else if (count == 3) {
            image = pokemon.image3
        } else if (count == 4) {
            image = pokemon.image4
        } else if (count == 5) {
            image = pokemon.image5
        } else {
            image = "https://upload.wikimedia.org/wikipedia/commons/d/d1/Image_not_available.png"
        }
        count++
    } while (image == null);
    return image
}
function updateDashboard(text) {
    if (text == 'DataPokemon' || text == 'All') {
        PokemonsDetails = [...DataPokemon]        
    } else if (text == 'MyPokemons') {
        PokemonsDetails = PokemonsDetailsByPlayer(MyPokemons)
    } else if (text == 'FriendPokemons') {
        PokemonsDetails = PokemonsDetailsByPlayer(FriendPokemons)
    } else if (text == 'FrndPkmnsRpt') {//Friend, pokemons repeated
        let repeat = PokemonsDetailsByPlayer(FriendPokemons)
        PokemonsDetails = repeat.filter(x => x.count > 1)
    } else {
        let filterPokemon = DataPokemon.filter(pokemon =>
            pokemon.type == text
        )
        PokemonsDetails = filterPokemon        
    }
    TotalPokemons = PokemonsDetails.length
    printButtons()
}

function getPokemonDetails() {
    return fetch("https://pokeapi.co/api/v2/pokemon?limit=10000")
        .then(response => response.json())
        .then(resp => {
            const promises = resp.results.map(result => {
                const pokemon = new newPokemon(result);
                return pokemon.getData();
            });

            return Promise.all(promises);
        })
        .then(Details => {
            DataPokemon = Details;
            updateDashboard('DataPokemon')
            PokemonTypes = Types()
            loading(MyPokemons)
        })
        .catch(error => {
            console.error('Error al obtener detalles de Pokémon:', error);
        });
}

function printCard(num, pokemonsPlayer) {
    if (PokemonsDetails.length >= 1) {
        $("#cards").removeClass("hide")
        $(".empty-msg").addClass("hide")
        let end = cardsPerPage * num
        let start = end - cardsPerPage

        let container = $("#cards").html("")
        for (var i = start; i <= end - 1; i++) {
            let indice = PokemonsDetails.indexOf(PokemonsDetails[i])
            if (indice < PokemonsDetails.length && indice >= 0) {
                cardPokemon(container, PokemonsDetails[i], pokemonsPlayer)
            }
        }
    } else {
        $("#cards").addClass("hide")
        $(".empty-msg").removeClass("hide")        
    }       
}
function cardPokemon(container, pokemon, pokemonsPlayer,player) {
    let image = getPokemonImage(pokemon)
    let style = pokemonsPlayer.find(x => x == pokemon.id) == null
        ? `style="filter:contrast(0.02)"`
        : ``
    let count = pokemon.count > 1 ? pokemon.count : ''
    let element = document.createRange().createContextualFragment(`
            
                <div class="card card-pokemon relative cont-opacity" data-player="${player}" data-pkId="${pokemon.id}" data-count="${count}">
                    <span class="right absolute m-0 z-10">${pokemon.id}</span>
                    <div class="size-100 just-center">
                        <img src="${image}" alt="Alternate Text" ${style} />
                    </div>
                    <div class="count">${count}</div>
                </div>
            `
    );
    
    container.append(element)
}

function countPokemon(array) { 
    
    let count = array.reduce((prev, current) => {
        prev[current] = (prev[current] || 0) + 1;
        return prev
    }, {} )
   
    return count
}

function printButtons(num) {
    let first_btn = parseInt($("#buttons button:first-child").html())
    let last_btn = parseInt($("#buttons button:last-child").html())
    let totalBtns = parseInt(TotalPokemons / cardsPerPage) + 1    
    let count = 0    
    let start = 0

    if (totalBtns > 1) {
        if (num === 1 && start <= totalBtns) {
            if (last_btn < totalBtns) {
                start = first_btn + visibleButtons
            } else {
                return
            }
        } else if (num === 0 && first_btn != 1) {
            start = first_btn - visibleButtons
        } else {
            start = first_btn = 1 ? 1 : first_btn + 1
        }

        $("#buttons").html("")
        do {
            let btns = $("#buttons").html()
            $("#buttons").html(
                btns + `<button class="prnt">${start}<input type="checkbox" name="name" value="" /></button>`
            )
            start += 1
            count += 1
        } while (count < visibleButtons && start <= totalBtns);
        $(".pages").removeClass("hide")
    }
    
}

function Types() {
    $("#PokemonTypes").html("")
    $("#PokemonTypes").html(`
        <li>
            <button class="btn-type">All</button>
        </li>
    `)
    let types = new Set(PokemonsDetails.map(pokemon => pokemon.type))
    types.forEach(type => {
        let btns = $("#PokemonTypes").html()
        $("#PokemonTypes").html(
            btns +
            `<li>
                <button type="button" class="btn-type">${type}</button>
            </li>
            `
        )
    })
    $(".types").removeClass("hide")
    return types
}

//Update dashboard with the diferent types of pokemon
$(document).on("click", ".btn-type", function () {
    let type = $(this).html()
    updateDashboard(type)
    loading(MyPokemons)
})

function loading(pokemonGroup) {
    printCard(1, pokemonGroup)    
    
    
    $(".loading").addClass('hide')
}
function validateHome() {
    if (TotalPokemons == null || TotalPokemons == undefined) {
        getPokemonDetails()
    } else {
        loading(MyPokemons)
    }
}

$(document).on("click", ".prnt", function () {
    $("#buttons").children("button").children(":checkbox").prop("checked","")
    $(this).children(":checkbox").prop("checked", "true")
    let num = $(this).text()
    let view = $("#view-frndDtls").attr("data-view")
    let pokemonGroup = view == "frndDtls"? FriendPokemons: MyPokemons
    printCard(num, pokemonGroup)
})

// Header buttons
$(".btn-view").click(function () {
    MyPokemons = []
    let partialView = $(this).attr('id')
    if (partialView != "AllPokemons") {
        $("#li-types").addClass("hide")
    } else {
        $("#li-types").removeClass("hide")
    }
    $(".btn-view").css("color", "#707070")
    $(this).css("color","white")
    $("#p-view").load('/Home/'+partialView, function () {
        if (partialView == 'AllPokemons') {
            
            updateDashboard('DataPokemon')
            validateHome()
            Types()
        } else if (partialView == 'MyPokemons') {
            
            updateDashboard(partialView)
            validateHome()
        }
        refresh()        
    })
})

function PokemonsDetailsByPlayer(pokemonsIds) {
    
    let pk = []

    let uniquePokemons = countPokemon(pokemonsIds)
    for (let id in uniquePokemons) {
        let pokemon = DataPokemon.find(x => x.id == id)
        pokemon.count = uniquePokemons[id]
        pk.push(pokemon)
    }

    return pk
}

$(".log_regis").click(function () {
    const btn_log = $(this).html()
    $("#required").addClass("hide")
    $("#Account_form").html("")
    $("#message").html("")
    if (btn_log == 'Log in now') {        
        $("#Account_form").load("/Account/Login")
        $("#span_registered").html("Don't have an account?")
        $(this).html('Register')
    } else {
        $("#Account_form").load("/Account/NewUser")
        $("#span_registered").html("Already a member?")
        $(this).html('Log in now')
    }
})

$(document).on("click", ".btn-logReg", function (e) {
    e.preventDefault()
    $("#required").addClass("hide")
    let form = $(this).closest("form")
    let mod = $(this).attr("data-modal")
    let action = $(form, "first").attr("action")
    let formData = form.serialize()
    if (!form[0].checkValidity()) {
        $("#required").html("Please fill all fields")
        $("#required").removeClass("hide")
    } else {
        $.ajax({
            data: formData,
            type: 'POST',
            dataType: 'JSON',
            url: action,
            cache: false,
            success:function (response) { 
                if (response.status == 1) {
                    if (response.data != null) {                        
                        $(location).attr("href", "/Home/Index") 
                    } else {
                        modal(mod, response.message)
                        $("#Account_form").load("/Account/Login")
                        $(form).children("input").val("")
                    }
                } else {
                    modal(mod, response.message)
                }
            },
            error: function (e) {
                console.log("An error has occurred " + e)
            }
        })
    }
})
function debounce(func, delay) {
    var timeout;
    return function () {
        clearTimeout(timeout);
        timeout = setTimeout(func, delay);
    };
}

function modal(data, message) {
    $("#" + data).html("")
    $("#" + data).html(
        `<div class="modal bg-opacity">
            <div class="modal-message">
                <h3 class="just-center">${message}</h3>
                <button class="mod-hide mod-btn" data-close="${data}">OK</button> 
            </div>
        </div>`
    )
}
function modalPokemonDetails(pkId,count) {
    let pokemon = PokemonsDetails.find(x => x.id == pkId)
    let view = $("#view-frndDtls").attr("data-view")
    let image = getHD_PokemonImage(pokemon)

    $("#pk_details").html("")
    $("#pk_details").html(
        `<div class="modal bg-opacity">
            <div class="modal-message">
                <div class="relative cont-opacity" data-pkId="${pokemon.id}">
                    <span class="right absolute m-0 z-10">
                        <button class="mod-hide mod-x" data-close="pk_details"></button>
                    </span>
                    <div class="size-100 just-center">
                        <img src="${image}" alt="Alternate Text"  /> 
                        <div class="form align-center m-1">
                            <div class="form-group">
                                <label>Name:</label>
                                <input class="form-details" type="text" readonly value="${pokemon.name}"/>
                            </div>
                            <div class="form-group">
                                <label>Id:</label>
                                <input class="form-details" type="text" readonly value="${pokemon.id}"/>
                            </div>
                            <div class="form-group">
                                <label>Type:</label>
                                <input class="form-details" type="text" readonly value="${pokemon.type}"/>
                            </div>
                            <div class="form-group">
                                <label>Weight:</label>
                                <input class="form-details" type="text" readonly value="${pokemon.weight}"/>
                            </div>
                            <div class="trade form-group hide"></div>
                        </div>
                    </div>                    
                </div>                 
            </div>
        </div>`
    )
    if (count > 1 && view == "frndDtls") {
        $(".trade").removeClass("hide")
        let form = $(".trade").html("")
        let btn_trade = document.createRange().createContextualFragment(`
            <button class="slct-trade mod-hide" data-pk="${pokemon.id}" data-close="pk_details">Trade this Pokemon</button>
        `)

        form.append(btn_trade)
    }
    $("#pk_details").removeClass("hide")
}
$(document).on("click", ".card-pokemon", function () {
    let pk = $(this).attr("data-pkId")
    let count = $(this).attr("data-count")
    modalPokemonDetails(pk,count)
})
$(document).on("click", ".mod-hide", function(){
    let close = $(this).attr("data-close")
    $("#" + close).addClass("hide")
})
$(".menu-sh").click(function () {
    if ($(".btns-header").hasClass("menu-panel")) {
        $(".btns-header").removeClass("menu-panel")
    } else {
        $(".btns-header").addClass("menu-panel")
    }
    
})
$(document).on("click", ".btn-tab",function(){    
    let ulParent = $(this).closest("ul")
    $(ulParent).children("li").children(":checkbox").prop("checked","")
    let liParent = $(this).closest("li")
    $(liParent).children(":checkbox").prop("checked","true")

    let type = parseInt($(this).attr("data-type"))
    $("#playersType").removeClass("hide")
    getPlayersType(type)
})
function getPlayersType(type) {
    
    $.ajax({
        data: { type },
        type: "POST",
        dataType: "JSON",
        url: "/Home/GetPlayersType",
        cache: false,
        success: function (response) {
            $("#playersType").html("")
            $("#dataFriend").html("")
            printPlayerCard(response, type)
        },
        error: function (e) {
            console.error("An error has occurred ", e)
        }
    })
}
function printPlayerCard(players,type) {
    
    if (players.length > 0) {
        for (var i = 0; i < players.length; i++) {
            let card = $("#playersType").html()
            let tx = ""
            let btn_cancel = ""
            if (players[i].FriendStatus == 1) {
                if (type == 3) {
                    players[i].FriendStatus = 0
                    tx = "Accept"
                    btn_cancel = `
                    <button class="btn-follow" data-friend="${players[i].playerID}" data-type="3">
                        Delete                        
                    </button>`
                } else {
                    tx = "Pending";
                }                
            } else if (players[i].FriendStatus == 2) {
                tx = "Following"
            } else {
                tx = "Follow"                
            }
            let frnd = type == 2 ? 'frnd': ''
            $("#playersType").html(card +
                `<div class="playerCard">
                    <img class="${frnd}" data-friend="${players[i].playerID}" src="${players[i].Image}" alt="Alternate Text" />
                    <span class="ml-1 width-40">${players[i].playerName}</span>
                    <div>
                        <span class="d-block">${players[i].city}</span>
                        <span class="d-block">Pokemons: ${players[i].Pokemons}</span>
                    </div>
                    <div class="fr-btns">
                        <button class="btn-follow ${tx}" data-friend="${players[i].playerID}" data-type="${players[i].FriendStatus}">
                            <span class="text1">${tx}</span>
                            <span class="text2 hide">Delete</span>
                        </button>
                        ${btn_cancel}
                    </div>                
                </div>`
            )
        }  
    } else {
        $("#playersType").html(
            `<div class="playerCard">                
                <span class="ml-1 width-100 just-center">Empty</span>                
            </div>`
        )
    }      
}
$(document).on("click", ".btn-follow", function () {
    
    let btn = this
    let frendID = parseInt($(this).attr("data-friend"))
    let type = parseInt($(this).attr("data-type"))

    $.ajax({
        data : { frendID, type },
        type : "POST",
        dataType : "JSON",
        url : "/Home/FriendRequest",
        cache : false,
        success: function (response) {
            if (response.type == 2 || response.type == 3) {
                getPlayersType(response.type)
            } else {
                if (response.type == 0) {
                    $(btn).removeClass("Pending")
                } else {
                    $(btn).addClass("Pending")
                }
                $(btn).children(".text1").html(response.btn)                
                $(btn).attr("data-type", response.type)
            }            
        },
        error: function (e) {
            console.log("An error has occurred " + e)
        }
    })
})
$(document).on("click", "#getPokemon", function () {
    let position = Math.floor(Math.random() * DataPokemon.length + 1)
    let pokemon = DataPokemon[position]
    
        $.ajax({
            data: { pokemonID: pokemon.id },
            dataType : "JSON",
            type : "POST",
            url : "/Home/SetNewPokemon",
            cache: false,
            success: function (response) {
                if (response.status == 1) {
                    modalNewPokemon(pokemon, response.player)
                    $("#last-pokemon").html(response.date)                    
                } else {
                    customAlert(response)
                }
                refresh()
            },
            error: function (e) {
                console.error("An error has occurred" + e)
            }
        })
})

function modalNewPokemon(pokemon, player) {
    let image = getHD_PokemonImage(pokemon)
    let container = $("#container-newPokemon").html("")
    let div = document.createRange().createContextualFragment(
        `<div class="width-100 heigth-60 just-center flx-col">
        <div class="size-100">
        <div class="relative cont-opacity" data-pkId="${pokemon.id}">
            <img class="" src="${image}" />
        </div>
        </div>        
        <span class="tx-center">Congratulations ${player}, now you have a/an ${pokemon.name}</span>
    </div>`
    )

    container.append(div)
}
$(document).on("click", ".frnd", function () {
    let friendID = $(this).attr("data-friend")
    $("#vw-plyrs").addClass("hide")
    FriendPokemons = []
    $("#dataFriend").load('/Home/FriendDetails?friendID=' + friendID , function () {
        updateDashboard("FriendPokemons")        
        loading(FriendPokemons)
    })
})

$(document).on("click", ".back", function () {
    let hide = $(this).attr("data-hide")
    let show = $(this).attr("data-show")

    $("#" + hide).html("")
    $("#" + show).removeClass("hide")
})

$(document).on("click", ".btn-pkmnTrd", function () {
    if ($(this).hasClass("btn-rpt")) {
        updateDashboard("FrndPkmnsRpt")
        $(this).addClass("hide")
        $(".btn-all-pkmns").removeClass("hide")
    } else {
        updateDashboard("FriendPokemons")
        $(this).addClass("hide")
        $(".btn-rpt").removeClass("hide")
    }    
    
    loading(FriendPokemons)
})
$(document).on("click", ".slct-trade", function () {
    let id = parseInt($(this).attr("data-pk"))    
    let pokemon = DataPokemon.find(x => x.id == id)    
    let player = $("#view-frndDtls").attr('data-player')
        
    let container;
    if ($("#container-trade1").html() == "") {
        container = $("#container-trade1").html("")        
        let myId = $("#myPlayerID").html()
        $("#dataFriend").load('/Home/FriendDetails?friendID=' + myId, function () {
            updateDashboard("FriendPokemons")
            loading(FriendPokemons)
        })
        
    } else {
        container = $("#container-trade2").html("")

        $("#mod-trade").removeClass("hide")
        $("#view-frndDtls").html("")
        $("#vw-plyrs").removeClass("hide")
    }
    
    cardPokemon(container, pokemon, FriendPokemons,player)    
})

$(document).on("click", ".btn-trade", function () {
    
    let type = $(this).attr("data-type")
    if (type == 1) {
        let pk1 = {
            player: $('#container-trade1').children(0).attr('data-player'),
            pokemon: $('#container-trade1').children(0).attr('data-pkid'),
        }
        let pk2 = {
            player: $('#container-trade2').children(0).attr('data-player'),
            pokemon: $('#container-trade2').children(0).attr('data-pkid'),
        }
        trade(pk1, pk2)
    } else {
        
        console.log("cancelar el intercambio")
    }
    $("#container-trade1").html("")
    $("#container-trade2").html("")
})

function trade(pk1, pk2) {
    let pokemon1 = JSON.stringify(pk1)
    let pokemon2 = JSON.stringify(pk2)
    $.ajax({
        data: { pokemon1, pokemon2 },
        dataType: 'JSON',
        type: 'POST',
        url: 'PokemonTrade',
        cache: false,
        success: function (response) {
            //if (response.status == 1) {
            //    alert(response.message)
            //} else {
            //    console.log(response.message)
            //}
            customAlert(response)
            refresh()
        },
        error: function (e) {            
            console.log('ocurrio un error. Error: ' + e)
        }
    })
}
function refresh() {
    $.ajax({
        type: 'POST',
        url: 'Refresh',
        cache: false,
        success: (response) => {
            $("#playerPoints").html(response.points)
            $("#city").html(response.weather.weather[0].description)
        },
        error: (e) => {
            console.log('An error has occurred. Error: ' + e)
        }
    })
}
function customAlert(response) {
    let container = $("#alert").html("")
    let alertMessage = document.createRange().createContextualFragment(`
        <div class="modal-message card-black">
            <i class="${response.icon}"></i>
            <div style="padding:10px">                
                <h3 class="tx-center">${response.message}</h3>                
            </div>
            <button class="mod-hide mod-btn" data-close="alert">OK</button>
        </div>
    `)
    container.append(alertMessage)
    $("#alert").removeClass("hide")
}
$(document).on("click", ".btn-trade-action", function () {
    let tradeID = $(this).attr("data-trade")
    let isAccept = $(this).hasClass("accept")
    if (!isAccept) {
        if (!confirm("This request will be deleted. Do you want to continue?")) {
            return
        } 
    }
    
    $.ajax({
        data: { tradeID, isAccept },
        type: "POST",
        dataType: "JSON",
        url: "Trading",
        cache: false,
        success: function (response) {
            customAlert(response)
            refresh()
            $("#p-view").load('/Home/requests', function () {
                console.log("Requests has been loaded")
            })
        },
        error: function (e) {
            console.error("An error has occurred. Error: " + e)
        }
    })
})

$(document).on("keyup", "#search-player", function () {
    $("input[type=checkbox]").prop("checked", false)
    let val = $(this).val().toLowerCase()
    let players = document.querySelectorAll(".playerName")
    
    players.forEach(player => {
        let name = player.innerHTML.toLowerCase()        
        if (!name.includes(val)) {
            $(player).parent("div").css("display", "none")
        } else {
            $(player).parent("div").css("display", "block")
        }
    })
})

$(document).on("click", "#submitPoints", function () {    
    let points = $("#points").val()
    let checks = $(".inputCheck:checked")
    let players = checks.map(function() {
        return this.id
    }).get()    
    let stringPlayers = JSON.stringify(players)

    $.ajax({
        data: { stringPlayers, points },
        type: "POST",
        dataType: "JSON",
        url: "SetPoints",
        cache: false,
        success: function (response) {
            refresh();
            customAlert(response)
            if (response.error) {
                console.error(response.error)
            }            
        },
        error: function (e) {
            console.log("An error has occurred. Error:" + e)
        }
    });
})

$(document).on("click", "#all", function () {
    let isChecked = $(this).prop("checked")

    $(".inputCheck:visible").prop("checked", isChecked)
      
})

$(document).on("click", ".avatar", function () {
    let id = $(this).data("id")
    $("#avatar").val(id)
    $(".avatarImage").html(`
        <img data-id="@i"
        style="border-radius:50%; width:70px; height:70px"
        src="https://rickandmortyapi.com/api/character/avatar/${id}.jpeg"
        alt="Alternate Text" />
    `)
    $("#characters").addClass("hide")
})

$(document).on("click", ".showAvatares", function () {
    $("#characters").removeClass("hide")
})

$(document).on("keyup", "#checkName", function () {
    let name = this.value

    $.ajax({
        data: { name },
        type: "POST",
        dataType: "JSON",
        url: "/Account/CheckName",
        cache: false,
        success: function (response) {
            if (response.status == 1) {
                $("#required").html("")
                $("#required").addClass("hide")
                $(".btn-logReg").attr("desabled",true)
            } else {
                $("#required").html(response.message)
                $("#required").removeClass("hide")
            }            
        },
        error: function (e) {
            console.log("An error has occurred. Error:" + e)
        }
    });
})