/**
 * Script para agregar datos de jugadores de muestra para el mini-juego
 */

import { db } from './server/db.ts';
import { players, playerStats } from './shared/schema.ts';

async function seedPlayers() {
  try {
    console.log('Iniciando carga de jugadores de muestra...');
    
    // Verificar si ya hay jugadores en la base de datos
    const existingPlayers = await db.select().from(players);
    if (existingPlayers.length > 0) {
      console.log(`Ya hay ${existingPlayers.length} jugadores en la base de datos. Omitiendo carga.`);
      return;
    }
    
    // Jugadores del Real Madrid - temporada actual
    const playerData = [
      {
        name: 'Thibaut Courtois',
        position: 'Portero',
        number: 1,
        country: 'Bélgica',
        birthDate: '1992-05-11',
        height: 199,
        weight: 96,
        photo: 'https://img.a.transfermarkt.technology/portrait/big/108390-1661788170.jpg',
        isActive: true
      },
      {
        name: 'Andriy Lunin',
        position: 'Portero',
        number: 13,
        country: 'Ucrania',
        birthDate: '1999-02-11',
        height: 191,
        weight: 80,
        photo: 'https://img.a.transfermarkt.technology/portrait/big/404979-1661789016.jpg',
        isActive: true
      },
      {
        name: 'Antonio Rüdiger',
        position: 'Defensa central',
        number: 22,
        country: 'Alemania',
        birthDate: '1993-03-03',
        height: 190,
        weight: 85,
        photo: 'https://img.a.transfermarkt.technology/portrait/big/86202-1675689765.jpg',
        isActive: true
      },
      {
        name: 'Éder Militão',
        position: 'Defensa central',
        number: 3,
        country: 'Brasil',
        birthDate: '1998-01-18',
        height: 186,
        weight: 78,
        photo: 'https://img.a.transfermarkt.technology/portrait/big/401530-1671097766.jpg',
        isActive: true
      },
      {
        name: 'David Alaba',
        position: 'Defensa central',
        number: 4,
        country: 'Austria',
        birthDate: '1992-06-24',
        height: 180,
        weight: 78,
        photo: 'https://img.a.transfermarkt.technology/portrait/big/59016-1661785707.jpg',
        isActive: true
      },
      {
        name: 'Dani Carvajal',
        position: 'Lateral derecho',
        number: 2,
        country: 'España',
        birthDate: '1992-01-11',
        height: 173,
        weight: 73,
        photo: 'https://img.a.transfermarkt.technology/portrait/big/138927-1665503181.jpg',
        isActive: true
      },
      {
        name: 'Ferland Mendy',
        position: 'Lateral izquierdo',
        number: 23,
        country: 'Francia',
        birthDate: '1995-06-08',
        height: 180,
        weight: 73,
        photo: 'https://img.a.transfermarkt.technology/portrait/big/291417-1661786904.jpg',
        isActive: true
      },
      {
        name: 'Aurélien Tchouaméni',
        position: 'Mediocentro',
        number: 18,
        country: 'Francia',
        birthDate: '2000-01-27',
        height: 187,
        weight: 81,
        photo: 'https://img.a.transfermarkt.technology/portrait/big/461005-1661789321.jpg',
        isActive: true
      },
      {
        name: 'Eduardo Camavinga',
        position: 'Mediocentro',
        number: 12,
        country: 'Francia',
        birthDate: '2002-11-10',
        height: 182,
        weight: 68,
        photo: 'https://img.a.transfermarkt.technology/portrait/big/640323-1661787982.jpg',
        isActive: true
      },
      {
        name: 'Federico Valverde',
        position: 'Mediocentro',
        number: 15,
        country: 'Uruguay',
        birthDate: '1998-07-22',
        height: 182,
        weight: 78,
        photo: 'https://img.a.transfermarkt.technology/portrait/big/369081-1661788906.jpg',
        isActive: true
      },
      {
        name: 'Luka Modrić',
        position: 'Mediocentro',
        number: 10,
        country: 'Croacia',
        birthDate: '1985-09-09',
        height: 172,
        weight: 66,
        photo: 'https://img.a.transfermarkt.technology/portrait/big/27992-1675689697.jpg',
        isActive: true
      },
      {
        name: 'Toni Kroos',
        position: 'Mediocentro',
        number: 8,
        country: 'Alemania',
        birthDate: '1990-01-04',
        height: 183,
        weight: 76,
        photo: 'https://img.a.transfermarkt.technology/portrait/big/31909-1661788633.jpg',
        isActive: true
      },
      {
        name: 'Jude Bellingham',
        position: 'Mediocentro ofensivo',
        number: 5,
        country: 'Inglaterra',
        birthDate: '2003-06-29',
        height: 186,
        weight: 75,
        photo: 'https://img.a.transfermarkt.technology/portrait/big/581678-1689936908.jpg',
        isActive: true
      },
      {
        name: 'Vinícius Júnior',
        position: 'Extremo izquierdo',
        number: 7,
        country: 'Brasil',
        birthDate: '2000-07-12',
        height: 176,
        weight: 73,
        photo: 'https://img.a.transfermarkt.technology/portrait/big/371998-1665071457.jpg',
        isActive: true
      },
      {
        name: 'Rodrygo',
        position: 'Extremo derecho',
        number: 11,
        country: 'Brasil',
        birthDate: '2001-01-09',
        height: 174,
        weight: 64,
        photo: 'https://img.a.transfermarkt.technology/portrait/big/412363-1661789247.jpg',
        isActive: true
      },
      {
        name: 'Kylian Mbappé',
        position: 'Delantero centro',
        number: 9,
        country: 'Francia',
        birthDate: '1998-12-20',
        height: 178,
        weight: 73,
        photo: 'https://img.a.transfermarkt.technology/portrait/big/342229-1700211578.jpg',
        isActive: true
      }
    ];
    
    // Insertar jugadores
    for (const player of playerData) {
      const [insertedPlayer] = await db.insert(players).values(player).returning();
      console.log(`Jugador agregado: ${player.name} (ID: ${insertedPlayer.id})`);
      
      // Agregar estadísticas para cada jugador
      const stats = generatePlayerStats(insertedPlayer.id, player.position);
      await db.insert(playerStats).values(stats).returning();
      console.log(`Estadísticas agregadas para: ${player.name}`);
    }
    
    console.log('Carga de jugadores completada con éxito.');
  } catch (error) {
    console.error('Error al cargar jugadores de muestra:', error);
  }
}

// Genera estadísticas aleatorias según la posición del jugador
function generatePlayerStats(playerId, position) {
  const season = '2024/2025';
  let goals, assists, appearances, yellowCards, redCards, minutesPlayed, passAccuracy, aerialDuelsWon, rating;
  
  // Valores base según posición
  switch (position) {
    case 'Portero':
      goals = randomInt(0, 0);
      assists = randomInt(0, 2);
      appearances = randomInt(20, 38);
      yellowCards = randomInt(0, 3);
      redCards = randomInt(0, 1);
      minutesPlayed = appearances * 90;
      passAccuracy = randomInt(70, 85);
      aerialDuelsWon = randomInt(5, 15);
      rating = randomInt(65, 90);
      break;
    case 'Defensa central':
    case 'Lateral derecho':
    case 'Lateral izquierdo':
      goals = randomInt(0, 3);
      assists = randomInt(1, 5);
      appearances = randomInt(25, 38);
      yellowCards = randomInt(2, 8);
      redCards = randomInt(0, 2);
      minutesPlayed = appearances * 85;
      passAccuracy = randomInt(75, 88);
      aerialDuelsWon = randomInt(20, 80);
      rating = randomInt(70, 88);
      break;
    case 'Mediocentro':
      goals = randomInt(1, 5);
      assists = randomInt(3, 10);
      appearances = randomInt(25, 38);
      yellowCards = randomInt(3, 9);
      redCards = randomInt(0, 1);
      minutesPlayed = appearances * 80;
      passAccuracy = randomInt(82, 92);
      aerialDuelsWon = randomInt(10, 40);
      rating = randomInt(75, 92);
      break;
    case 'Mediocentro ofensivo':
      goals = randomInt(5, 15);
      assists = randomInt(5, 15);
      appearances = randomInt(30, 38);
      yellowCards = randomInt(2, 7);
      redCards = randomInt(0, 1);
      minutesPlayed = appearances * 80;
      passAccuracy = randomInt(80, 90);
      aerialDuelsWon = randomInt(10, 30);
      rating = randomInt(80, 95);
      break;
    case 'Extremo izquierdo':
    case 'Extremo derecho':
      goals = randomInt(10, 20);
      assists = randomInt(7, 15);
      appearances = randomInt(30, 38);
      yellowCards = randomInt(1, 5);
      redCards = randomInt(0, 1);
      minutesPlayed = appearances * 75;
      passAccuracy = randomInt(75, 88);
      aerialDuelsWon = randomInt(5, 25);
      rating = randomInt(80, 94);
      break;
    case 'Delantero centro':
      goals = randomInt(15, 35);
      assists = randomInt(5, 12);
      appearances = randomInt(30, 38);
      yellowCards = randomInt(1, 4);
      redCards = randomInt(0, 1);
      minutesPlayed = appearances * 80;
      passAccuracy = randomInt(70, 85);
      aerialDuelsWon = randomInt(20, 60);
      rating = randomInt(80, 95);
      break;
    default:
      goals = randomInt(2, 8);
      assists = randomInt(2, 8);
      appearances = randomInt(20, 35);
      yellowCards = randomInt(2, 6);
      redCards = randomInt(0, 1);
      minutesPlayed = appearances * 75;
      passAccuracy = randomInt(75, 85);
      aerialDuelsWon = randomInt(10, 30);
      rating = randomInt(70, 85);
  }
  
  return {
    playerId,
    season,
    goals,
    assists,
    appearances,
    yellowCards,
    redCards,
    minutesPlayed,
    passAccuracy,
    aerialDuelsWon,
    rating,
    createdAt: new Date()
  };
}

// Función auxiliar para generar número aleatorio entre min y max (inclusive)
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Ejecutar el script de seed
seedPlayers().then(() => {
  console.log('Proceso de seed completado.');
  process.exit(0);
}).catch(error => {
  console.error('Error en el proceso de seed:', error);
  process.exit(1);
});

// Agregar export para compatibilidad con ES modules
export { seedPlayers };