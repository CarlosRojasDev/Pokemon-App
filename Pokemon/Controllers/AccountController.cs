using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;
using System.Xml.Linq;
using Newtonsoft.Json;
using Pokemon.Models;

namespace Pokemon.Controllers
{
    public class AccountController : Controller
    {
        readonly Context db = new Context();
        // GET: Account
        public ActionResult Index()
        {
            return View();
        }

        public PartialViewResult Login()
        {
            return PartialView();
        }
        public PartialViewResult NewUser()
        {
            return PartialView();
        }

        public JsonResult Log(string playerName, string password)
        {
            object result;

            string pw = Encode(password);

            Players player = db.Players.Where(x => x.playerName == playerName && x.password == pw).FirstOrDefault();            

            if (player != null)
            {
                FormsAuthentication.SetAuthCookie(player.profileID.ToString(), false);
                
                result = new
                {
                    status = 1,
                    message = "Welcome",
                    data = true,
                };
                Session["player"] = player;
                Session["myPokemons"] = db.PokemonsDetails.Where(x => x.playerID == player.playerID).Select(x => x.pokemonID).ToList();
                
            }
            else
            {
                result = new
                {
                    status = 0,
                    message = "Incorrect user or password.",
                };
            }


            return Json(result, JsonRequestBehavior.AllowGet);
        }
        //[HttpPost]
        public JsonResult CreateUser(Players formData)
        {
            object result;

            Players player = db.Players.Where(x => x.playerName == formData.playerName).FirstOrDefault();

            if (player != null)
            {
                result = new
                {
                    status = 0,
                    message = "This user already exists."
                };
            }
            else
            {
                try
                {
                    player = new Players
                    {
                        playerName = formData.playerName,
                        password = Encode(formData.password),
                        city = formData.city,
                        points = 20,
                        profileID = 2,
                        avatar = formData.avatar,
                        country = formData.country,
                    };


                    db.Players.Add(player);
                    db.SaveChanges();

                    result = new
                    {
                        status = 1,
                        message = "The user has been created successfully."
                    };
                }
                catch (Exception)
                {
                    result = new
                    {
                        status = 0,
                        message = "An error occurred, please try again."
                    };
                }
            }

            return Json(result, JsonRequestBehavior.AllowGet);
        }

        public ActionResult SingOut()
        {
            FormsAuthentication.SignOut();
            return RedirectToAction("Index");
        }

        public string Encode(string password)
        {
            SHA256 sHA256 = SHA256.Create();
            ASCIIEncoding aSCIIEncoding = new ASCIIEncoding();            
            StringBuilder sb = new StringBuilder();
            byte[] bytes = sHA256.ComputeHash(aSCIIEncoding.GetBytes(password));
            for (int i = 0; i < bytes.Length; i++) sb.AppendFormat("{0:x2}", bytes[i]);
            return sb.ToString();
        }
        public JsonResult CheckName(string name)
        {
            object response;
            Players player = db.Players.Where(x => x.playerName == name).FirstOrDefault();
            if (player == null)
            {
                response = new
                {
                    status = 1                   
                };
            }
            else
            {
                response = new
                {
                    status = 0,
                    message = "A user with that name already exists."
                };
            }
            return Json(response,JsonRequestBehavior.AllowGet);
        }
    }
}