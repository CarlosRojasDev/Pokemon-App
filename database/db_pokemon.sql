USE [pokemons]
GO
/****** Object:  Table [dbo].[friends]    Script Date: 5/22/2024 11:43:20 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[friends](
	[friendEntryId] [int] IDENTITY(1,1) NOT NULL,
	[player1_id] [int] NOT NULL,
	[player2_id] [int] NOT NULL,
	[friendStatus] [int] NULL,
	[updated] [datetime] NULL,
 CONSTRAINT [PK_friends] PRIMARY KEY CLUSTERED 
(
	[friendEntryId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Players]    Script Date: 5/22/2024 11:43:20 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Players](
	[playerID] [int] IDENTITY(1,1) NOT NULL,
	[playerName] [varchar](50) NULL,
	[city] [varchar](50) NULL,
	[points] [int] NULL,
	[profileID] [int] NULL,
	[avatar] [int] NULL,
	[password] [varchar](100) NULL,
	[country] [nchar](10) NULL,
 CONSTRAINT [PK_Players] PRIMARY KEY CLUSTERED 
(
	[playerID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[PokemonsDetails]    Script Date: 5/22/2024 11:43:20 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PokemonsDetails](
	[pokemonDetail_ID] [int] IDENTITY(1,1) NOT NULL,
	[pokemonID] [int] NULL,
	[playerID] [int] NULL,
	[entryDate] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[pokemonDetail_ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Profiles]    Script Date: 5/22/2024 11:43:20 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Profiles](
	[profileID] [int] NOT NULL,
	[profileName] [varchar](20) NULL,
 CONSTRAINT [PK__Profiles__7D416399D45893C5] PRIMARY KEY CLUSTERED 
(
	[profileID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Trade_pokemon]    Script Date: 5/22/2024 11:43:20 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Trade_pokemon](
	[tradeID] [int] IDENTITY(1,1) NOT NULL,
	[requestSentTo] [int] NULL,
	[trade_PokemonID] [int] NULL,
	[request_by] [int] NULL,
	[trade_by_PokemonID] [int] NULL,
	[trade_status] [bit] NULL,
	[dateRequest] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[tradeID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[friends]  WITH CHECK ADD  CONSTRAINT [FK_friends_Players] FOREIGN KEY([player1_id])
REFERENCES [dbo].[Players] ([playerID])
GO
ALTER TABLE [dbo].[friends] CHECK CONSTRAINT [FK_friends_Players]
GO
ALTER TABLE [dbo].[friends]  WITH CHECK ADD  CONSTRAINT [FK_friends_Players1] FOREIGN KEY([player2_id])
REFERENCES [dbo].[Players] ([playerID])
GO
ALTER TABLE [dbo].[friends] CHECK CONSTRAINT [FK_friends_Players1]
GO
ALTER TABLE [dbo].[Players]  WITH CHECK ADD  CONSTRAINT [FK_Players_Profiles] FOREIGN KEY([profileID])
REFERENCES [dbo].[Profiles] ([profileID])
GO
ALTER TABLE [dbo].[Players] CHECK CONSTRAINT [FK_Players_Profiles]
GO
ALTER TABLE [dbo].[PokemonsDetails]  WITH CHECK ADD  CONSTRAINT [FK_PokemonsDetails_Players] FOREIGN KEY([playerID])
REFERENCES [dbo].[Players] ([playerID])
GO
ALTER TABLE [dbo].[PokemonsDetails] CHECK CONSTRAINT [FK_PokemonsDetails_Players]
GO
ALTER TABLE [dbo].[Trade_pokemon]  WITH CHECK ADD  CONSTRAINT [FK_Trade_pokemon_Players] FOREIGN KEY([requestSentTo])
REFERENCES [dbo].[Players] ([playerID])
GO
ALTER TABLE [dbo].[Trade_pokemon] CHECK CONSTRAINT [FK_Trade_pokemon_Players]
GO
ALTER TABLE [dbo].[Trade_pokemon]  WITH CHECK ADD  CONSTRAINT [FK_Trade_pokemon_Players1] FOREIGN KEY([request_by])
REFERENCES [dbo].[Players] ([playerID])
GO
ALTER TABLE [dbo].[Trade_pokemon] CHECK CONSTRAINT [FK_Trade_pokemon_Players1]
GO
