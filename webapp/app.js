"use strict";

// URL où aller chercher les infos
const URL = "https://ginkobus-server.onrender.com"; 

/************************************************************************
 *                                                                      *
 *                  Ginko Bus Progressive Web Application               *
 *                                                                      *
 ************************************************************************/
document.addEventListener("DOMContentLoaded", function (_e) {

    /******************************************************************
            Fonctions à compléter dans la dernière partie du TP 
    ******************************************************************/
    
    // Fonction exécutée quand on clique sur l'icône de géolocalisation 
    function geoloc() {
        if ("geolocation" in navigator) {
            var btnGeoloc = document.querySelector("#bcStations .btnGeoloc");
            if (btnGeoloc.classList.contains("active")) {
                for (var st in stations) {
                    delete stations[st].distance;   
                }
                fSort = null;
                btnGeoloc.classList.remove("active");
                remplirStations();
                return;
            }
            navigator.geolocation.getCurrentPosition(function(position) {
                fSort = function(position, id1, id2) {
                    var d1 = distance(stations[id1].lat, stations[id1].lon, position.coords.latitude, position.coords.longitude);
                    var d2 = distance(stations[id2].lat, stations[id2].lon, position.coords.latitude, position.coords.longitude);
                    return d1 - d2;
                }.bind(null, position);
                for (var sta in stations) {
                    var st = stations[sta];
                    st.distance = distance(st.lat, st.lon, position.coords.latitude, position.coords.longitude) / 1000;
                    st.distance = st.distance.toFixed(2);
                }
                btnGeoloc.classList.add("active");
                remplirStations();
            });
        }
        else {
            alert("Votre appareil ne supporte pas la géolocalisation.");    
        }
    }
    
    function distance(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // metres
        const phi1 = lat1 * Math.PI/180; // φ, λ in radians
        const phi2 = lat2 * Math.PI/180;
        const deltaPhi = (lat2-lat1) * Math.PI/180;
        const deltaLambda = (lon2-lon1) * Math.PI/180;

        const a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) +
                  Math.cos(phi1) * Math.cos(phi2) *
                  Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        const d = R * c; // in metres
        return d;
    }
        
        
    
    
    /******************************************************************
                            Gestion des événements 
    ******************************************************************/
    
    /** Touch Events related to the bcStart block **/
    let touchStart = {
        x: null,
        y: null
    };
    document.getElementById("bcStart").addEventListener("touchstart", function (e) {
        touchStart.x = e.changedTouches.item(0).clientX;
        touchStart.y = e.changedTouches.item(0).clientY;
    }, {
        passive: true
    });
    document.getElementById("bcStart").addEventListener("touchend", function (e) {
        // horizontal slide (right-to-left --> close this panel)
        if (touchStart.y - e.changedTouches.item(0).clientY > window.innerHeight / 2) {
            this.style.top = "-120vh";
        } else {
            // vertical slide (top-to-bottom --> reload the application)
            if (e.changedTouches.item(0).clientY - touchStart.y > window.innerHeight / 2) {
                if (confirm("Recharger l'application ?")) {
                    window.location.reload(true);
                }
            } else {
                document.querySelector("#bcStart p").innerHTML =
                    (Math.random() < 0.33) ? "Allez, un petit effort..." :
                    (Math.random() < 0.5) ? "Tu peux pas faire mieux que ça ?" :
                    "T'as pas de force dans les doigts ?";
            }
        }
    }, {
        passive: true
    });

    
    /** 
     *     Swipe left-right dans les horaires pour passer au précédent/suivant
     */
    document.querySelector("aside > header").addEventListener("touchstart", function (e) {
        touchStart.x = e.changedTouches.item(0).clientX;
        touchStart.y = e.changedTouches.item(0).clientY;
    }, {
        passive: true
    });
    document.querySelector("aside > header").addEventListener("touchend", function (e) {
        if (touchStart.x - e.changedTouches.item(0).clientX > window.innerWidth / 4) {
            // suivant 
            var max = document.querySelectorAll('aside input[type="radio"]').length;
            var index = 1 * document.querySelector('aside input[type="radio"]:checked').value;
            if (index < max - 1) {
                selectionnerHoraires(index + 1);
            }
        } else if (touchStart.x - e.changedTouches.item(0).clientX < -window.innerWidth / 4) {
            // précédent
            var index = 1 * document.querySelector('aside input[type="radio"]:checked').value;
            if (index > 0) {
                selectionnerHoraires(index - 1);
            }
        } else if (touchStart.y - e.changedTouches.item(0).clientY > 30) {
            // bas
            document.querySelector('aside input[type="number"]').stepDown();
            refreshHoraires();
            
        } else if (touchStart.y - e.changedTouches.item(0).clientY < -30) {
            // haut
            document.querySelector('aside input[type="number"]').stepUp();
            refreshHoraires();
        }
    }, {
        passive: true
    });
    // Fonction utilitaire, balayage des horaires
    function selectionnerHoraires(index) {
        var listTD = document.querySelectorAll("aside td:nth-child(2)");
        for (var i = 0; i < listTD.length; i++) {
            var td = listTD.item(i);
            var tab = td.dataset.horaires.split(",");
            if (index < 0 || index >= tab.length) {
                return;
            }
            td.innerHTML = tab[index];
        }
        // update display
        document.querySelector('aside input[value="' + index + '"]').checked = true;
    }


    /** 
     *  Clic dans la zone principale (blocs #lignes, #stations)
     */
    document.querySelector("main").addEventListener("click", function (e) {
        var target = e.target;
        // clic sur un bouton "favori"
        if (target.tagName == "SPAN" && target.classList.contains("btnFavoris")) {
            e.stopPropagation();
            var li = target.parentElement;
            favoris.toggle(li.dataset.station, li.dataset.ligne, li.dataset.direction);
            favoris.refresh();
            target.classList.toggle("favori");
            return;
        }
        // clic sur une case du tableau (bloc aside)
        if (target.tagName == "TD") {
            // effacer l'éventuelle sélection 
            document.querySelector('#bcStations input[type="text"]').value = "";
            // mise à jour de la liste
            fFilter = null;
            remplirStations();
            var id = target.parentElement.dataset.station;
            // sélectionne les stations
            document.getElementById("radStations").click();
            // sélection et scroll vers la station considérée
            document.getElementById("cb_" + id).checked = true;
            document.querySelector("#cb_" + id + " + label + ul").scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
            // hide panel
            document.querySelector("main aside").classList.remove("visible");
        }
        // clic sur un autre type de span -> passage sur le parent
        if (e.target.tagName == "SPAN") {
            target = target.parentElement;
        }
        // si on a cliqué sur un élément présentant des data-ligne, data-direction, et éventuellement un data-station
        if (target.dataset && target.dataset.ligne) {
            var now = new Date();
            var date = "" +
                now.getFullYear() +
                String(now.getMonth() + 1).padStart(2, "0") +
                String(now.getDate()).padStart(2, "0");
            afficherHoraires(target.dataset.ligne, target.dataset.direction, target.dataset.station, date, String(now.getHours()).padStart(2, "0"));
            
        }
    });

    /** 
     *  Changement dans la date --> reconsultation des horaires
     */
    document.querySelector('aside input[type="date"]').addEventListener("change", refreshHoraires);
    /** 
     *  Changement dans l'heure --> reconsultation des horaires
     */
    document.querySelector('aside input[type="number"]').addEventListener("change", refreshHoraires);
    
    /** 
     *  Mise à jour des horaires.
     */
    function refreshHoraires() {
        var aside = document.querySelector("main aside div.liste");
        var date = document.querySelector('main aside header input[type="date"]').value.split("-").join("");
        var heure = document.querySelector('main aside header input[type="number"]').value;
        heure = String(heure).padStart(2, "0");
        afficherHoraires(aside.dataset.ligne, aside.dataset.direction, aside.dataset.station, date, heure);
    }

    /**
     *  Fermeture du bloc aside
     */
    document.querySelector("aside .btnClose").addEventListener("click", function () {
        this.parentElement.classList.remove("visible");
    });
        
    
    // Solves the 100vh bug on iOS (on iOS: 100vh includes the address bar height) 
    window.onresize = function () {
        document.body.height = window.innerHeight;
    }
    window.onresize(); // called to initially set the height.

    
    
    
    /******************************************************************
                            Modèle de données 
    ******************************************************************/
    

    /** 
     *  Objet permettant la gestion des favoris (station, ligne, direction)
     */
    var favoris = { 
        // map listant les stations favorites sous la forme (station:ligne:direction)
        contenu: (function() {
            if (! localStorage.getItem("favorites")) {
                localStorage.setItem("favorites", "{}");   
            }
            return JSON.parse(localStorage.getItem("favorites"));
        })(), 
        /**
         *  Teste si l'ensemble des favoris contient le favori en paramètres
         */
        contains: function(station, ligne, direction) {
            return this.contenu[[station, ligne, direction].join(":")] != undefined;
        },
        /**
         *  Ajoute/retire la station des favoris 
         */
        toggle: function(station, ligne, direction) {
            var str = [station, ligne, direction].join(":");
            if (this.contenu[str]) {
                delete this.contenu[str];
            }   
            else {
                this.contenu[str] = 1;
            }
            localStorage.setItem("favorites", JSON.stringify(this.contenu));
        },
        /**
         *  Rafraîchit la zone d'affichage des favoris.
         */
        refresh: function() {
            var tab = Object.keys(this.contenu).sort();
            if (tab.length == 0) {
                document.querySelector("#bcHome").innerHTML = "<p>Pas de station favorite.</p>";
                return;
            }
            var html = "";
            var last = null;
            for (var line of tab) {
                var tLine = line.split(":");
                var s = tLine[0];
                var l = tLine[1];
                var d = tLine[2];
                if (s != last) {
                    if (html.length > 0) {
                        html += "</ul>";   
                    }
                    html += "<label>" + stations[s].nom + "</label><ul>";
                }
                last = s;
                var fg = lignes[l].fg;
                var bg = lignes[l].bg;
                html += "<li data-ligne='" + l + "' data-direction='" + d + "' data-station='" + s + "'>" +
                        "<span class='btnFavoris favori'></span> " + 
                        "<span class='noLigne' style='color: #" + fg + "; background-color: #" + bg + ";'>" +
                        lignes[l].numero + "</span> " + stations[s].lignes[l][d].split("par")[0] +
                        "</li>";
            }
            html += "</ul>";
            document.querySelector("#bcHome").innerHTML = "<div class='liste'>" + html + "</div>";
        }
    };
    
    
    
    // Ensemble de stations { id -> { nom, latitude, longitude, ... } }
    var stations = {};
    // Ensemble de lignes 
    var lignes = {};

    
    /******************************************************************
                        Fonctions utiles 
    ******************************************************************/

                
    /** 
     *  Initialisation avec des appels asynchrones
     */
    (async function init() {

        document.querySelector("#bcStart p").innerHTML = "Chargement des lignes...";
                
        // récupère les lignes 
        var response = await fetch(URL + '/lignes');
        if (response.status != 200) {
            alert("Impossible de charger les lignes.");
            return;
        }
        // lecture du JSON et affichage 
        lignes = await response.json();
        afficherLignes();

        document.querySelector("#bcStart p").innerHTML = "Chargement des stations...";
                
        // récupère les stations 
        response = await fetch(URL + '/stations');
        if (response.status != 200) {
            alert("Impossible de charger les stations.");
            return;
        }
        // lecture du JSON et affichage 
        stations = await response.json();
        afficherStations();
                        
        // fin du chargement
        document.querySelector("#bcStart h2").style.display = "block";
        document.querySelector("#bcStart p").innerHTML = "";
        favoris.refresh();
        
        // si pas de favoris --> affichage des lignes
        if (Object.values(favoris.contenu).length == 0) {
            document.getElementById("radLignes").checked = true;
        }
    })();
    
    
    
    /**
     *  Affichage des lignes dans le bloc #bcLignes
     */
    function afficherLignes() {
        var r = "<div class='liste'>";
        for (var l in lignes) {
            var fg = lignes[l].fg,
                bg = lignes[l].bg,
                numero = lignes[l].numero,
                nom = lignes[l].nom;
            var id = "cb_" + lignes[l].id;
            r +=
                "<input type='checkbox' id='" + id + "'>" +
                "<label for='" + id + "' style='background-color: #" + bg + "; color: #" + fg + ";'>" +
                (numero ? numero + ' - ' : "") + nom + "</label>" +
                "<ul>";
            for (var d in lignes[l].direction) {
                r += "<li data-ligne='" + l + "' data-direction='" + d + "'>" +
                    "<span class='noLigne' style='background-color: #" + bg + "; color: #" + fg + ";'>" +
                    (numero ? numero : '&nbsp;') + "</span> " + lignes[l].direction[d] + "</li>";
            }

            r += "</ul>";
        }
        r += "</div>";
        document.getElementById("bcLignes").innerHTML = r;
    }



    /**
     *  Affichage des stations dans le bloc #bcStations
     */
    function afficherStations() {
        var header = document.createElement("header");
        var div = document.createElement("div");
        var input = document.createElement("input");
        var butt = document.createElement("span");

        // Entête : input type text qui sert de filtre et bouton de géolocalisation
        header.innerHTML = "Filtre : ";
        input.type = "text";
        input.addEventListener("keyup", function () {
            fFilter = function(st) { 
                return st.nom.toLowerCase().indexOf(document.querySelector('#bcStations input[type="text"]').value.toLowerCase()) >= 0; 
            };
            remplirStations();
        });
        header.appendChild(input);

        // bouton de géolocalisation
        butt.classList.add("btnGeoloc");
        butt.innerHTML = "&#x1F4CD;";
        butt.addEventListener("click", geoloc);
        header.appendChild(butt);
        
        // Contenu : liste des stations 
        div.className = 'liste';
        // ajouts aux stations
        var bcStations = document.getElementById("bcStations");
        bcStations.appendChild(header);
        bcStations.appendChild(div);
        // remplissage du bloc de stations (pas de filtre, pas de tri) 
        remplirStations();
    }


    /************************************************************************* 
            Fonctions utilisées pour remplir la liste des stations 
    **************************************************************************/
    
    /** 
     *  Détermine si la station id1 précède ou pas la station id2.
     *  @param  String  id1     identifiant de station (ex. "st_battant")
     *  @param  String  id2     identifiant de station (ex. "st_battant")
     *  @return Number          < 0 si id1 précède id2, > 0 si id2 précède id1
     */
    var fSort = null;
    
    /** Détermine si la station passée en paramètre doit être affichée ou pas.
     *  @param  Object  st      l'objet Station à évaluer
     *  @return boolean         true si la station doit être affichée, false sinon
     */
    var fFilter = null;
    
    
    /** 
     *  Fonction permettant de remplir la liste des stations de #bcStations :
     *      - en les triant avec la fonction fSort et 
     *      - en les filtrant avec les résultats avec la fonction fFiltre
     */
    function remplirStations() {
        var r = "";
        // si un tri existe alors on trie par ordre alphabétique, sinon on trie par ordre alphabetique
        var keys = fSort ? Object.keys(stations).sort(fSort) : Object.keys(stations).sort();
        for (var k in keys) {
            var station = stations[keys[k]];
            // s'il y a un filtre et que la station ne passe pas ce filtre 
            if (fFilter && !fFilter(station)) {
                continue;   // --> on passe directement à la suivante
            }
            let id = "cb_" + station.id;
            r += "<input type='checkbox' id='" + id + "'>" +
                    "<label for='" + id + "'>" + 
                        station.nom + (station.distance ? " - " + station.distance + " km" : "") + 
                    "</label><ul>";
            for (var l in station.lignes) {
                for (var ll in station.lignes[l]) {
                    var fg = lignes[l].fg;
                    var bg = lignes[l].bg;
                    var fav = favoris.contains(station.id, l, ll) ? " favori" : "";
                    r += "<li data-ligne='" + l + "' data-direction='" + ll + "' data-station='" + station.id + "'>" +
                        "<span class='btnFavoris" + fav + "'></span> " + 
                        "<span class='noLigne' style='color: #" + fg + "; background-color: #" + bg + ";'>" +
                        lignes[l].numero + "</span> " + station.lignes[l][ll].split("par")[0] +
                        "</li>";
                }
            }
            r += "</ul>";
        }
        document.querySelector('#bcStations .liste').innerHTML = r;
    }

        
    /** 
     *  Affichage des horaires dans le bloc "aside"
     */
    async function afficherHoraires(ligne, direction, station, date, heure) {
        
        document.body.classList.add("fade");
        
        var aside = document.querySelector("main aside div.liste");

        aside.setAttribute("data-ligne", ligne);
        aside.setAttribute("data-direction", direction);
        aside.setAttribute("data-station", station ? station : "");

        var fg = lignes[ligne].fg;
        var bg = lignes[ligne].bg;
        var nom = (lignes[ligne].numero ? lignes[ligne].numero + " - " : "") + lignes[ligne].nom;
        var dir = lignes[ligne].direction[direction];

        var p = document.querySelector("aside header p");
        p.innerHTML = nom + "<br><span>Direction " + dir + "</span>";
        p.setAttribute("style", "color: #" + fg + "; background-color: #" + bg + ";");

        document.querySelector('aside header input[type="number"]').value = heure;
        date = String(date);
        document.querySelector('aside header input[type="date"]').value = date.substr(0, 4) + "-" + date.substr(4, 2) + "-" + date.substr(6);

        // récupère les trajets et les horaires 
        fetch(URL + '/horaires/' + ligne + '/' + direction + '/' + date + '/' + heure)
        .then(async function(response) {
            if (response.status != 200) {
                alert("Impossible de charger les horaires.");
                return;
            }
            // lecture du JSON
            var horaires = await response.json();
            var keys = Object.keys(horaires);
            var nb = keys.length;

            // retrait des 
            var divRadio = document.querySelector("aside header div:nth-of-type(2)");
            while (divRadio.firstChild) {
                divRadio.removeChild(divRadio.firstChild);
            }
            if (nb == 0) {
                aside.innerHTML = "<p>Pas de passage à cet horaire.</p>";
            } else {
                // zone avec les boutons radio 
                for (var i = 0; i < nb; i++) {
                    var lbl = document.createElement("label");
                    lbl.classList.add("btnRadioOrange");
                    var rad = document.createElement("input");
                    rad.type = "radio";
                    rad.name = "radHoraire";
                    rad.id = "radHoraire" + i;
                    lbl.setAttribute("for", rad.id);
                    rad.value = i;
                    lbl.addEventListener("click", function () {
                        selectionnerHoraires(this.previousSibling.value);
                    });
                    divRadio.appendChild(rad);
                    divRadio.appendChild(lbl);
                }
                document.querySelector("aside header").appendChild(divRadio);

                // tri par horaire de passage                
                keys = keys.sort(function (e1, e2) {
                    var idx1 = 0;
                    for (let i=0; i < horaires[e1].length; i++) {
                        if (!horaires[e1][i].horaire.startsWith("--")) {
                            idx1 = i;
                            break;
                        }
                    }
                    var idx2 = 0;
                    for (let i=0; i < horaires[e2].length; i++) {
                        if (!horaires[e2][i].horaire.startsWith("--")) {
                            idx2 = i;
                            break;
                        }
                    }
                    var h1 = 1 * horaires[e1][idx1].horaire.substr(0, 2);
                    var h2 = 1 * horaires[e2][idx2].horaire.substr(0, 2);
                    var m1 = 1 * horaires[e1][idx1].horaire.substr(3, 2);
                    var m2 = 1 * horaires[e2][idx2].horaire.substr(3, 2);
                    return (h1 < h2 || h1 == h2 && m1 < m2) ? -1 : 1;
                });
                var html = "<table>";
                var key0 = keys[0];
                var index = 0;
                for (var t in horaires[key0]) {
                    html += "<tr" + (station == horaires[key0][t].arret ? " class='selected'" : "") +
                        " data-station='" + horaires[key0][t].arret + "'>" + 
                        "<td>" + stations[horaires[key0][t].arret].nom + "</td>";
                    var tab = [];
                    for (var h of keys) {
                        tab.push(horaires[h][t].horaire);    
                    }
                    html += "<td data-horaires='" + tab + "'></td></tr>";
                }
                html += "</table>";
                aside.innerHTML = html;
                selectionnerHoraires(0);

                // cas où une station était sélectionnée 
                if (station) {
                    var sel = document.querySelector("aside tr.selected");
                    if (sel) { 
                        // scroll jusqu'à la station courante 
                        sel.scrollIntoView({
                            behavior: "smooth",
                            block: "center"
                        });
                        // recherche de l'horaire futur le plus proche
                        var lth = sel.querySelector("td:last-child").dataset.horaires.split(",");
                        var index = lth.length - 1;
                        var now = new Date();
                        var hhmm = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0") 
                        while (index > 0 && lth[index-1] >= hhmm) {
                            index--;   
                        }
                        selectionnerHoraires(index);
                    }
                }
            }
            aside.parentElement.classList.add("visible");
            document.body.classList.remove("fade");        
        }, function(error) {
            // Erreur récupération des horaires --> pour gérer le mode OFFLINE
            document.querySelector("aside .liste").innerHTML = 
                "<p style='font-size: 200%;'>&#128244;</p><p>Impossible de récupérer les données depuis le serveur.</p>";
            aside.parentElement.classList.add("visible");
            document.body.classList.remove("fade");
        });
    }

});
