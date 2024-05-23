using Newtonsoft.Json;
using Pokemon.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Dynamic;
using System.Linq;
using System.Net.Http;
using System.Web.Mvc;
using static Pokemon.Models.WeatherDetails;

namespace Pokemon.Controllers
{
    [Authorize]
    public class HomeController : Controller
    {
        readonly Context db = new Context();
        public ActionResult Index()
        {            
            if (!(Session["player"] is Players player))
            {
                return Redirect("~/Account/Index");
            }
            
            return View(player);
        }
        public PartialViewResult MyPokemons()
        {
            Players player = Session["player"] as Players;
            List<PokemonsDetail> myPokemons = new List<PokemonsDetail>();
            myPokemons = db.PokemonsDetails.Where(x => x.playerID == player.playerID)
                                           .OrderBy(x => x.pokemonID).ToList();

            return PartialView(myPokemons);            
        }
        public PartialViewResult AllPokemons()
        {
            ViewBag.myPokemons = Session["myPokemons"];
            return PartialView();
        }
        public PartialViewResult Players()
        {
            List<DataPlayers> players = GetPlayers();
            return PartialView(players);
        }
        public PartialViewResult NewPokemon()
        {
            string date = LastPokemon().ToString();
            ViewBag.lastPokemon = date == "" ? "Empty": date;
            return PartialView();
        }
        public PartialViewResult Requests()
        {
            Players player = Session["player"] as Players;
            List<Trade_pokemon> trade_Pokemons = db.Trade_pokemon
                            .Where(x => x.trade_status == false && (x.request_by == player.playerID
                            || x.requestSentTo == player.playerID)).Include(x => x.Players)
                            .Include(x => x.Players1).ToList();
            
            ViewBag.userID = player.playerID;
            return PartialView(trade_Pokemons);
        }
        public PartialViewResult FriendDetails(int friendID)
        {
            Players player = new Players();
            player = db.Players.Where(x => x.playerID == friendID).FirstOrDefault();
            var pokemonList = db.PokemonsDetails.Where(x => x.playerID == player.playerID)
                                                .Select(x => x.pokemonID).ToList();
            DataPlayers playerData = new DataPlayers            
            {
                playerID = player.playerID,
                playerName = player.playerName,
                city = player.city,
                Pokemons = pokemonList.Count(),
                Image = "https://rickandmortyapi.com/api/character/avatar/" + player.avatar + ".jpeg",
                country = player.country,
            };
            
            ViewBag.pokemonList = pokemonList;


            return PartialView(playerData);
        }
        public PartialViewResult AdminPoints()
        {           
            List<Players> players = db.Players.ToList();
            
            return PartialView(players);
        }
        public JsonResult GetPlayersType(int type)
        {
            Players currentPlayer = Session["player"] as Players;
            List<Players> players = new List<Players>();
            List<DataPlayers> data = new List<DataPlayers>();
            if (type == 1)
            {
                data = GetPlayers();
            }
            else 
            {
                List<friends> friends = new List<friends>();

                if (type == 2)
                {
                    friends = db.friends.Where( x => (x.player1_id == currentPlayer.playerID ||
                                                x.player2_id == currentPlayer.playerID) &&
                                                x.friendStatus == 2).ToList();
                }
                else
                {
                    friends = db.friends.Where( x => x.player2_id == currentPlayer.playerID &&
                                                x.friendStatus == 1).ToList();
                }                

                foreach (var item in friends)
                {
                    var friendID =  item.player2_id == currentPlayer.playerID? 
                                    item.player1_id : item.player2_id;                    

                    Players modelPlayer = db.Players.Where(x => x.playerID == friendID).FirstOrDefault();

                    int pokemons = db.PokemonsDetails.Count(x => x.playerID == modelPlayer.playerID);

                    DataPlayers model = new DataPlayers
                    {
                        playerID = modelPlayer.playerID,
                        playerName = modelPlayer.playerName,
                        city = modelPlayer.city,
                        FriendStatus = item.friendStatus,
                        Pokemons = pokemons,
                        Image = "https://rickandmortyapi.com/api/character/avatar/"+ modelPlayer.avatar + ".jpeg",
                        country = modelPlayer.country,
                    };
                    //model.Image = model.GetImage();

                    data.Add(model);
                }
            }
            return Json(data);
        }
        public List<DataPlayers> GetPlayers()
        {
            Players currentPlayer = Session["player"] as Players;
            List<Players> PlayersList = db.Players.Where(x => x.playerID != currentPlayer.playerID).ToList();
            List<DataPlayers> data = new List<DataPlayers>();
            List<friends> friends = db.friends.Where(x =>   x.player1_id == currentPlayer.playerID || 
                                                            x.player2_id == currentPlayer.playerID).ToList();
            foreach (var item in PlayersList)
            {                
                friends friend = friends.Where(x => (x.player1_id == item.playerID || 
                                                     x.player2_id == item.playerID)).FirstOrDefault();

                if (friend == null || (friend.player1_id == currentPlayer.playerID 
                                       && friend.friendStatus == 1))

                {
                    int pokemons = db.PokemonsDetails.Count(x => x.playerID == item.playerID);
                    DataPlayers model = new DataPlayers
                    {
                        playerID = item.playerID,
                        playerName = item.playerName,
                        city = item.city,
                        FriendStatus = friend?.friendStatus ?? 0,
                        Pokemons = pokemons,
                        Image = "https://rickandmortyapi.com/api/character/avatar/" + item.avatar + ".jpeg",
                        country = item.country,
                    };                    

                    data.Add(model);
                }
            }
            return data;
        }
        public JsonResult FriendRequest(int frendID, int type)
        {
            Players player = Session["player"] as Players;
            friends friends =   db.friends.Where(x => x.player1_id == frendID 
                                && x.player2_id == player.playerID || x.player1_id == player.playerID 
                                && x.player2_id == frendID).FirstOrDefault();

            object response; 

            if (friends == null)
            {
                friends = new friends
                {
                    player1_id = player.playerID,
                    player2_id = frendID,
                    friendStatus = 1,
                    updated = DateTime.Now
                };

                db.friends.Add(friends);
                db.SaveChanges();

                response = new
                {
                    btn = "Pending",
                    type = 1
                };
            }
            else
            {
                if (type != 0) 
                {
                    db.friends.Remove(friends);
                    db.SaveChanges();

                    response = new
                    {
                        btn = "Follow",
                        type = type == 1 ? 0 : type
                    };
                }
                else
                {
                    friends.friendStatus = 2;
                    db.SaveChanges();

                    response = new
                    {
                        btn = "Following",
                        type = 3
                    };
                }
            }
            return Json(response);
        }
        public JsonResult SetNewPokemon(int pokemonID)
        {
            Players currentPlayer = Session["player"] as Players;
            Players players = db.Players.Where(x => x.playerID == currentPlayer.playerID).FirstOrDefault();
            object response;

            if (players.points < 1)
            {
                response = new
                {
                    message = "Sorry, you don't have points to get a new pokemon",
                    icon = "error"
                };
            }
            else
            {
                DateTime? dateTime = LastPokemon();
                dynamic diff = DateTime.Now - dateTime;
                if (diff == null || diff.Days >= 1)
                {

                    PokemonsDetail pokemonsDetail = new PokemonsDetail
                    {
                        pokemonID = pokemonID,
                        playerID = currentPlayer.playerID,
                        entryDate = DateTime.Now
                    };

                    db.PokemonsDetails.Add(pokemonsDetail);
                    players.points -= 1;
                    db.Entry(players).State = EntityState.Modified;
                    db.SaveChanges();
                    Session["myPokemons"] = db.PokemonsDetails.Where(x => x.playerID == currentPlayer.playerID)
                                                              .Select(x => x.pokemonID).ToList();

                    response = new
                    {
                        status = 1,
                        player = currentPlayer.playerName,
                        date = LastPokemon().ToString()
                    };
                }
                else
                {
                    response = new
                    {
                        status = 0,
                        message = "You must wait 24 hours after acquiring your " +
                                  "last Pokémon before obtaining a new one",
                        icon = "info"
                    };
                }
            }
            return Json(response, JsonRequestBehavior.AllowGet);
        }
        public JsonResult MyPokemonRepeats()
        {
            Players player = Session["player"] as Players;
            var pokemonList = db.PokemonsDetails.Where(x => x.playerID == player.playerID)
                                                .Select(x => x.pokemonID).ToList();

            return Json(pokemonList, JsonRequestBehavior.AllowGet);
        }
        public JsonResult PokemonTrade(string pokemon1, string pokemon2)
        {
            dynamic pk1 = JsonConvert.DeserializeObject<ExpandoObject>(pokemon1);
            dynamic pk2 = JsonConvert.DeserializeObject<ExpandoObject>(pokemon2);

            object response;

            int player1ID = Convert.ToInt32(pk1.player);
            int pokemon1ID = Convert.ToInt32(pk1.pokemon);
            int player2ID = Convert.ToInt32(pk2.player);
            int pokemon2ID = Convert.ToInt32(pk2.pokemon);
            if (TradeExist(player1ID, pokemon1ID, player2ID, pokemon2ID))
            {
                response = new
                {
                    message = "This request already exists, please check your requests tab",
                    icon = "info"
                };

                return Json(response, JsonRequestBehavior.AllowGet);
            }

            if (HasPoints(player1ID) && HasPoints(player2ID))
            {
                if (TradeValidation(pokemon1ID, player1ID) && TradeValidation(pokemon2ID, player2ID))
                {
                    Trade_pokemon trade_Pokemon = new Trade_pokemon
                    {
                        requestSentTo = player1ID,
                        trade_PokemonID = pokemon1ID,
                        request_by = player2ID,
                        trade_by_PokemonID = pokemon2ID,
                        trade_status = false,
                        dateRequest = DateTime.Now
                    };

                    db.Trade_pokemon.Add(trade_Pokemon);
                    db.SaveChanges();

                    response = new
                    {
                        message = "The request has been sent successfully",
                        status = 1,
                        icon = "success"
                    };
                }
                else
                {
                    response = new
                    {
                        message = "Trading is not possible, the pokemons are not in your pokemon list",
                        status = 0,
                        icon= "error"
                    };
                }
            }
            else
            {
                response = new
                {
                    message = "Trading is not possible, players don't have enough points for this trade",
                    status = 0, 
                    icon= "error"
                };
            }
            
            
            return Json(response,JsonRequestBehavior.AllowGet);
        }
        public bool TradeValidation(int pokemoID, int playerID)
        {   
            List<PokemonsDetail> listPokemons = 
            db.PokemonsDetails.Where(x => x.playerID == playerID).ToList();
            var pokemon = listPokemons.Find(x => x.pokemonID == pokemoID);
            if (pokemon == null)
            {
                return false;
            }
            return true;
        }
        public bool HasPoints(int? playerID)
        {
            Players player = db.Players.Where(x => x.playerID == playerID).FirstOrDefault();
            if (player.points < 5 )
            {
                return false;
            }
            return true;
        }
        public JsonResult Refresh()
        {            
            Players players = Session["player"] as Players;
            int? getPoints = db.Players.Where(x => x.playerID == players.playerID)
                                    .Select(x => x.points).FirstOrDefault();

            string playerCity = players.city + "," + players.country;

            Weather getWeather = Weather(players.city);

            object result = new { 
                points = getPoints,
                weather = getWeather,
            };

            return Json(result,JsonRequestBehavior.AllowGet);
        }
        public JsonResult Trading(int tradeID, bool isAccept)
        {
            object response;
            Trade_pokemon trade = db.Trade_pokemon.Find(tradeID);
            if (!isAccept)
            {                
                db.Trade_pokemon.Remove(trade);
                db.SaveChanges();
                response = new
                {
                    message = "Request has been deleted",
                    icon = "success"
                };
            }
            else
            {
                if (HasPoints(trade.request_by) && HasPoints(trade.requestSentTo))
                {
                    if (HasPokemon(trade.request_by,trade.trade_by_PokemonID) &&
                        HasPokemon(trade.requestSentTo,trade.trade_PokemonID))
                    {
                        PokemonsDetail pokemon1 = db.PokemonsDetails.Where(x => x.playerID == trade.request_by && 
                                                x.pokemonID == trade.trade_by_PokemonID).FirstOrDefault();

                        PokemonsDetail pokemon2 = db.PokemonsDetails.Where(x => x.playerID == trade.requestSentTo &&
                                                x.pokemonID == trade.trade_PokemonID).FirstOrDefault();

                        Players player1 = db.Players.Where(x => x.playerID == trade.requestSentTo).FirstOrDefault();
                        Players player2 = db.Players.Where(x => x.playerID == trade.request_by).FirstOrDefault();

                        pokemon1.playerID = trade.requestSentTo;
                        pokemon2.playerID = trade.request_by;
                        trade.trade_status = true;
                        player1.points -= 5; 
                        player2.points -= 5;

                        

                        db.Entry(pokemon1).State = EntityState.Modified;
                        db.Entry(pokemon2).State = EntityState.Modified;
                        db.Entry(trade).State = EntityState.Modified;
                        db.Entry(player1).State = EntityState.Modified;
                        db.Entry(player2).State = EntityState.Modified;

                        db.SaveChanges();
                        response = new
                        {
                            message = "The trade was successful",
                            icon = "success"
                        };
                    }
                    else
                    {
                        response = new
                        {
                            message = "Trading is not possible, another trade was made previously",
                            icon = "error"
                        };
                    }
                    
                }
                else
                {
                    response = new
                    {
                        message = "Trading is not possible, players don't have enough points for this trade",
                        icon = "error"
                    };
                }
                
            }
            return Json(response,JsonRequestBehavior.AllowGet);
        }
        public bool HasPokemon(int? playerID, int? pokemonID)
        {
            List<PokemonsDetail> pokemonsDetail = db.PokemonsDetails.Where(x => x.playerID == playerID).ToList();
            var hasPokemon = pokemonsDetail.Find(x => x.pokemonID == pokemonID);
            if (hasPokemon == null)
            {
                return false;
            }
            return true;
        }
        public bool TradeExist(int player1ID, int pokemon1, int player2ID, int pokemon2)
        {
            Trade_pokemon trade = db.Trade_pokemon.Where(x => x.requestSentTo == player2ID
                                && x.trade_PokemonID == pokemon2 && x.request_by == player1ID
                                && x.trade_by_PokemonID == pokemon1 && x.trade_status == false)
                                .FirstOrDefault();

            Trade_pokemon trade2 = db.Trade_pokemon.Where(x => x.requestSentTo == player1ID
                                && x.trade_PokemonID == pokemon1 && x.request_by == player2ID
                                && x.trade_by_PokemonID == pokemon2 && x.trade_status == false)
                                .FirstOrDefault();

            if (trade == null && trade2 == null)
            {
                return false;
            }
            return true;
        }
        public DateTime? LastPokemon()
        {
            Players player = Session["player"] as Players;
            List<PokemonsDetail> details = db.PokemonsDetails.Where(x => x.playerID == player.playerID)
                                .OrderByDescending(x => x.pokemonDetail_ID).ToList();

            DateTime? last = details.Select(x => x.entryDate).FirstOrDefault();
            return last;
        }

        public JsonResult SetPoints(string stringPlayers, int points)
        {
            object response;
            if (string.IsNullOrEmpty(stringPlayers) || points <= 0 || stringPlayers == "[]")
            {
                string errorMessage = points <= 0 
                            ? "Points must be greater than zero"
                            : "You have not selected any player yet";

                response = new
                {
                    message = errorMessage,
                    icon = "error"
                };
            }
            else
            {                
                try
                {
                    List<int> Ids = JsonConvert.DeserializeObject<List<int>>(stringPlayers);

                    List<Players> players = db.Players.Where(x => Ids.Contains(x.playerID)).ToList();

                    foreach (var player in players)
                    {   
                        if (player != null)
                        {
                            player.points += points;

                            db.Entry(player).State = EntityState.Modified;
                        }                        
                    }

                    db.SaveChanges();
                    response = new
                    {
                        message = "Points have been successfully assigned",
                        icon = "success"
                    };
                }
                catch (Exception ex)
                {
                    response = new
                    {
                        message = "An error occurred while processing your request.",
                        icon = "error",
                        error = ex.ToString()
                    };
                }
               
            }            
            
            
            return Json(response,JsonRequestBehavior.AllowGet);
        }
        public Weather Weather(string city)
        {
            Weather model = new Weather();
            using (var client = new HttpClient())
            {
                client.BaseAddress = new Uri("https://api.openweathermap.org");
                var response = client.GetAsync("/data/2.5/weather?q=" + city + "&appid=cf66105e58a56619f093e4621ccacac8");
                response.Wait();
                var result = response.Result;
                if (result.IsSuccessStatusCode)
                {
                    var weather = result.Content.ReadAsAsync<Weather>();
                    weather.Wait();
                    model = weather.Result;
                }
                else
                {
                    model = new Weather();
                }
            }

            return model;
        }
    }
}