using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;

namespace Pokemon.Models
{
    public class DataPlayers: Players
    {
        public new int playerID { get; set; }
        public new string playerName { get; set; }        
        public new string city { get; set; }
        public int Pokemons { get; set; }
        public int? FriendStatus { get; set; }        
        public string Image { get; set; }        
    }
}