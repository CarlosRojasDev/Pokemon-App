﻿//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace Pokemon.Models
{
    using System;
    using System.Data.Entity;
    using System.Data.Entity.Infrastructure;
    
    public partial class Context : DbContext
    {
        public Context()
            : base("name=Context")
        {
        }
    
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            throw new UnintentionalCodeFirstException();
        }
    
        public virtual DbSet<PokemonsDetail> PokemonsDetails { get; set; }
        public virtual DbSet<Profile> Profiles { get; set; }
        public virtual DbSet<Trade_pokemon> Trade_pokemon { get; set; }
        public virtual DbSet<friends> friends { get; set; }
        public virtual DbSet<Players> Players { get; set; }
    }
}