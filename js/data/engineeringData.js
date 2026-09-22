export const rooms = {

    room1: {

        texture: "../images/MainHall/room1.jpg",

        hotspots: [

            {
                type: "move",
                target: "room2",
                x: 380,
                y: -80,
                z: 10
            },

            {
                type: "info",
                title: "Piano",
                description: "...",
                image: "../images/Piano.png",
                x: 170,
                y: 0,
                z: -390
            }

        ]

    },

    room2: {

        texture: "../images/MainHall/room2.jpg",

        hotspots: [

        ]

    }

};