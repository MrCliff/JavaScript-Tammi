"use strict";

var minLeveys = 8;
var maxLeveys = 16;
var ruutujaPerRivi = 8;
var minNappulasarakkeidenVali = 2;
var laudanMaxLeveysPx = 1000;

var valittuPelinappula = null;

window.onload = function() {
    var luontipainike = document.getElementById("luo");
    luontipainike.addEventListener("click", luoUusiLauta);
    
    var lomake = document.getElementById("ruudukko");
    var fieldset = lomake.getElementsByTagName("fieldset")[0];
    var leveysKentta = fieldset.getElementsByTagName("input")[0];
    if (!leveysKentta.value) leveysKentta.value = ruutujaPerRivi;
    
    fieldset.appendChild(luoNappulakyselija(5, 3));
    fieldset.appendChild(luoSuuntakyselija());

    luoUusiLauta();
};

window.onresize = sovitaNayttoon;


/**
 * Luo ja palauttaa uuden fieldset-elementin, jonka sisälle on luotu
 * nappulasarakemäärän kyselijä.
 * @param maara Nappuloiden maksimilukumäärä.
 * @param oletus Oletuksena valittu vaihtoehto. (Väliltä [1..maara])
 * @return Luotu fieldset-elementti.
 */
function luoNappulakyselija(maara, oletus) {
    var fieldset = document.createElement("fieldset");
    fieldset.setAttribute("id", "nappulasarakekysely");
    var legend = document.createElement("legend");
    legend.appendChild(document.createTextNode("Nappulasarakkeiden lukumäärä"));
    fieldset.appendChild(legend);
    
    for (var i = 1; i <= maara; i++) {
        var id = "nappulat" + i;
        
        var radioButton = document.createElement("input");
        radioButton.setAttribute("type", "radio");
        radioButton.setAttribute("value", i);
        radioButton.setAttribute("id", id);
        radioButton.setAttribute("name", "nappulasarakkeet");
        if (i == oletus) radioButton.setAttribute("checked", "checked");
        
        var label = document.createElement("label");
        label.setAttribute("class", "nappula-lkm");
        label.setAttribute("for", id);
        label.appendChild(document.createTextNode(i));
        
        var div = document.createElement("div");
        div.appendChild(label);
        div.appendChild(radioButton);
        
        fieldset.appendChild(div);
    }
    
    return fieldset;
}


/**
 * Luo kyselyelementin pelilaudan suunnan kyselyä varten.
 * @return Valmis suuntakyselijäelementti.
 */
function luoSuuntakyselija() {
    var fieldset = document.createElement("fieldset");
    fieldset.setAttribute("id", "suuntakysely");
    var legend = document.createElement("legend");
    legend.appendChild(document.createTextNode("Nappulasarakkeiden suunta"));
    fieldset.appendChild(legend);

    var div1 = luoRadioButtonDiv("suuntaPysty", 0, "nappulasuunta",
        "Pysty", "nappulasuunta", true);
    
    var div2 = luoRadioButtonDiv("suuntaVaaka", 1, "nappulasuunta",
        "Vaaka", "nappulasuunta", false);
    
    fieldset.appendChild(div1);
    fieldset.appendChild(div2);
    
    return fieldset;
}


/**
 * Luo div-elementin, jonka sisälle radio button-elementin halutulla nimellä
 * ja otsikolla.
 * @param id Radio buttonin id-arvo.
 * @param arvo Radio buttonin value-attribuutin arvo.
 * @param nimi Radio button -ryhmän nimi.
 * @param otsikko Radio buttonin viereen tuleva otsikko.
 * @param luokka Otsikon class-attribuutin arvo.
 * @param valittu Boolean-arvo, onko kyseinen radio button oletuksena valittu.
 * @return Valmis div-elementti.
 */
function luoRadioButtonDiv(id, arvo, nimi, otsikko, luokka, valittu) {
    var radioButton = document.createElement("input");
    radioButton.setAttribute("type", "radio");
    radioButton.setAttribute("value", arvo);
    radioButton.setAttribute("id", id);
    radioButton.setAttribute("name", nimi.toLowerCase());
    if (valittu) radioButton.setAttribute("checked", "checked");

    var label = document.createElement("label");
    if (luokka) label.setAttribute("class", luokka);
    label.setAttribute("for", id);
    label.appendChild(document.createTextNode(otsikko));

    var div = document.createElement("div");
    div.appendChild(label);
    div.appendChild(radioButton);

    return div;
}


/**
 * Luo uuden laudan kenttiin sijoitettujen arvojen perusteella.
 * @param event Tapahtuma, joka käynnisti tämän funktion suorituksen.
 */
function luoUusiLauta(event) {
    if (event) event.preventDefault();
    
    var lomake = document.getElementById("ruudukko");
    var leveysKentta = lomake.getElementsByTagName("input")[0];
    var leveys = parseInt(leveysKentta.value, 10);
    
    var maxNappuloita = Math.floor((leveys / 2) - (minNappulasarakkeidenVali / 2));
    var nappuloita = 0;
    var radiot = document.getElementById("nappulasarakekysely").getElementsByTagName("input");
    var valittu = etsiValittu(radiot);
    if (valittu !== -1) {
        nappuloita = radiot[valittu].value;
        
        var virheilmoitus = document.getElementById("nappulavirhe");
        if (virheilmoitus) virheilmoitus.parentNode.removeChild(virheilmoitus);
        
        if (maxNappuloita < nappuloita) {
            nappuloita = maxNappuloita;
            
            var virheilmoitus = luoVirheilmoitus("nappulavirhe", "Liikaa nappuloita!");
            radiot[valittu].parentNode.appendChild(virheilmoitus);
        }
    }
    
    var suuntaRadiot = document.getElementById("suuntakysely").getElementsByTagName("input");
    var valittuSuunta = parseInt(suuntaRadiot[etsiValittu(suuntaRadiot)].value);
    if (!valittuSuunta) valittuSuunta = 0;
    
    if (leveys && leveys >= minLeveys && leveys <= maxLeveys) {
        var virheilmoitus = document.getElementById("syotevirhe");
        if (virheilmoitus) leveysKentta.parentNode.removeChild(virheilmoitus);
        
        leveysKentta.value = leveys;
        ruutujaPerRivi = leveys;
        
        var taulukko = document.getElementsByTagName("table")[0];
        tyhjennaTaulukko(taulukko);

        luoLauta(taulukko, leveys);
        asetaNappulat(taulukko, nappuloita, valittuSuunta);
    }
    else {
        if (document.getElementById("syotevirhe")) return;
        
        var virheilmoitus = luoVirheilmoitus("syotevirhe", "Virheellinen syöte!");
        leveysKentta.parentNode.appendChild(virheilmoitus);
    }
    
    naytaVuoro();
    
    sovitaNayttoon();
}


/**
 * Luo taulukon, jossa on parametrina annettu määrä rivejä ja sarakkeita.
 * @param taulukko Taulukkoelementti, jonka sisälle pelilauta luodaan.
 * @param ruutuja Rivien ja sarakkeiden määrä.
 */
function luoLauta(taulukko, ruutuja) {
    for (var i = 0; i < ruutuja; i++) {
        var rivi = document.createElement("tr");
        
        for (var j = 0; j < ruutuja; j++) {
			var ruutu = luoRuutu(j, i);
			
            rivi.appendChild(ruutu);
        }
        
        taulukko.appendChild(rivi);
    }
	
	/**
	 * Antaa halutun ruudun taulukosta.
	 * @param rivi Halutun ruudun rivi.
	 * @param sarake Halutun ruudun sarake.
	 * @return Pyydetty ruutu tai null, jos ruutua ei löytynyt.
	 */
	taulukko.annaRuutu = function(rivi, sarake) {
		var rivit = this.children;
		if (rivi < 0 || rivi >= rivit.length) return null;
		var solut = rivit[rivi];
		if (sarake < 0 || sarake >= solut.length) return null;
		
		return solut[sarake];
	};
}


/**
 * Luo annetuissa koordinaateissa sijaitsevan ruudun.
 * @param x Ruudun x-koordinaatti (sarake).
 * @param y Ruudun y-koordinaatti (rivi).
 * @return Luotu ruutu.
 */
function luoRuutu(x, y) {
	var ruutu = document.createElement("td");
	ruutu.addEventListener("click", soluaKlikattu);

	ruutu.x = x;
	ruutu.y = y;
	
	/**
	 * Antaa rivin, jolla ruutu sijaitsee.
	 * @return Rivi, jolla ruutu sijaitsee.
	 */
	ruutu.getRivi = function() {
		return this.y;
	};
	
	/**
	 * Antaa sarakkeen, jolla ruutu sijaitsee.
	 * @return Sarake, jolla ruutu sijaitsee.
	 */
	ruutu.getSarake = function() {
		return this.x;
	};
	
	// /**
	 // * Antaa tiedon, onko viereisissä ruuduissa nappuloita vai ei.
	 // * @return true, jos jossain viereisessä ruudussa on nappula.
	 // */
	// ruutu.isNappuloitaVieressa = function() {
		
	// }
	
	return ruutu;
}


/**
 * Määrittää, mitä tehdään, kun pelilaudan ruutua klikataan hiirellä.
 * @param event Tapahtuma, joka tämän funktioajon aiheutti.
 */
function soluaKlikattu(event) {
    var ruutu = event.target;
    var nappula = ruutu.getElementsByTagName("svg")[0];
    if (nappula || ruutu.nodeName.toLowerCase() === "svg") {
        pelinappulaaKlikattu(event);
        return;
    }
    
    if (!valittuPelinappula || valittuPelinappula.parentNode === this) return;
    
	valittuPelinappula.siirra(ruutu);
    // ruutu.appendChild(valittuPelinappula);
    // valittuPelinappula.poistaValinta();
    // valittuPelinappula = null;
    
    // document.getElementById("vuoro-osoitin").vaihdaVuoroa();
}


/**
 * Poistaa parametrina annetun taulukon kaikki lapsisolmut.
 * @param taulukko Taulukko, jonka lapsielementit poistetaan.
 */
function tyhjennaTaulukko(taulukko) {
    while (taulukko.firstChild) {
        taulukko.removeChild(taulukko.firstChild);
    }
}


/**
 * Asettaa annettuun taulukkoon pelinappulat halutulle määrälle taulukon rivejä.
 * @param taulukko Taulukkoelementti, johon pelinappulat luodaan.
 * @param rivimaara Kuinka monta riviä nappuloita luodaan kummallekkin puolelle.
 * @param suunta Suunta, laitetaanko nappulat vastakkain pystysuunnassa
 * (suunta = 0) vai vaakasuunnassa (suunta = 1).
 */
function asetaNappulat(taulukko, rivimaara, suunta) {
    var rivit = taulukko.getElementsByTagName("tr");
    for (var i = 0; i < rivit.length; i++) {
        var solut = rivit[i].getElementsByTagName("td");
        for (var j = 0; j < solut.length; j++) {
            // Jos sekä rivi että sarake ovat parillisia tai parittomia,
            // skipataan solu.
            if (i % 2 === 1 && j % 2 === 1) continue;
            if (i % 2 === 0 && j % 2 === 0) continue;

            var indeksi = i;
            if (suunta === 0) indeksi = j;
            
            if (indeksi < solut.length / 2 && indeksi < rivimaara) {
				var nappula = luoNappula("red", "red", "#00ff00", 0);
                solut[j].appendChild(nappula);
            }
            
            if (indeksi >= solut.length / 2 && indeksi >= solut.length - rivimaara) {
                var nappula = luoNappula("blue", "blue", "#00ff00", 1);
				solut[j].appendChild(nappula);
            }
        }
    }
}


/**
 * Luo pelinappulan annetulla kuvalla ja kuvan vaihtoehtoisella tekstillä.
 * @param vari Pelinappulan väri.
 * @param alt Kuvan vaihtoehtoinen teksti.
 * @param valittuVari Pelinappulan väri, kun se on valittuna.
 * @param pelaaja Pelaaja, jonka nappula tämä on.
 * @return Luotu pelinappula.
 */
function luoNappula(vari, alt, valittuVari, pelaaja) {
    var nappula = luoYmpyra(vari, 20);
    nappula.addEventListener("click", pelinappulaaKlikattu);
    
    nappula.vari = vari;
	nappula.valittuVari = valittuVari;
	nappula.pelaaja = pelaaja;
	
	/**
	 * Muuttaa pelinappulan ulkonäön valitun pelinappulan näköiseksi.
	 */
	nappula.valitse = function() {
		this.vaihdaVaria(this.valittuVari);
	};
	
	/**
	 * Muuttaa pelinappulan ulkonäön alkuperäiseksi.
	 */
	nappula.poistaValinta = function() {
		this.vaihdaVaria(this.vari);
	};
	
	/**
	 * Antaa pelinappulan omistavan pelaajan numeron.
	 * @return Pelinappulan omistavan pelaajan numero.
	 */
	nappula.getPelaaja = function() {
		return this.pelaaja;
	};
	
	/**
	 * Antaa ruudun, jossa tämä nappula sijaitsee.
	 * @return Ruutu, jossa tämä nappula sijaitsee.
	 */
	nappula.getRuutu = function() {
		return this.parentNode;
	};
	
	/**
	 * Antaa tiedon, onko tämä nappula tällä hetkellä valittu nappula.
	 * @return true, jos tämä nappula on tällä hetkellä valittuna.
	 */
	nappula.isValittu = function() {
		return this === valittuPelinappula;
	}
	
	/**
	 * Kertoo totuusarvolla, voiko nykyistä nappulaa siirtää haluttuun ruutuun.
	 * @param ruutu Ruutu, johon pelinappula haluttaisiin siirtää.
	 * @return true, jos siirto on mahdollinen.
	 */
	nappula.voiSiirtaa = function(ruutu) {
		var nykyinenRuutu = getRuutu();
		
		if (this.isNappuloitaVieressa()) {
			var vihollisenNappulat = this.getNappulatVieressa();

			for (var i = 0; i < vihollisenNappulat.length; i++) {
				var ruutu = vihollisenNappulat[i];
				var suunta = 
			}
		}
		
	};
	
	/**
	 * Siirtää pelinappulan annettuun ruutuun, jos se on mahdollista ja
	 * siirtämisen jälkeen antaa tarvittaessa vuoron vastustajalle.
	 * @param ruutu Ruutu, johon nappulaa yritetään siirtää.
	 */
	nappula.siirra = function(ruutu) {
		if (this.voiSiirtaa(ruutu)) {
			
		}
	};
	
	/**
	 * Antaa tiedon, onko viereisissä ruuduissa vastustajan nappuloita vai ei.
	 * @return true, jos jossain viereisessä ruudussa on vastustajan nappula.
	 */
	nappula.isNappuloitaVieressa = function() {
		if (this.getNappulatVieressa().length > 0) return true;
		return false;
	};

	/**
	 * Antaa listan viereisissä ruuduissa olevista vihollisen nappuloista.
	 * @return Lista viereisissä ruuduissa olevista vihollisen nappuloista.
	 */
	nappula.getNappulatVieressa = function() {
		var nykyinenRuutu = getRuutu();
		var taulukko = document.getElementsByTagName("body")[0].getElementsByTagName("table")[0];
		var vihollisenNappulat = [];
		
		// Tammessa nappuloita voi olla vain kulmittaisissa ruuduissa
		var rivit = [-1, 1];
		var sarakkeet = [-1, 1];
		
		for (var i = 0; i < rivit.length; i++) {
			for (var j = 0; j < sarakkeet.length; j++) {
				var tarkasteltavaRivi = nykyinenRuutu.getRivi() + rivit[i];
				var tarkasteltavaSarake = nykyinenRuutu.getSarake() + sarakkeet[j];
				var tarkasteltava = taulukko.annaRuutu(
						tarkasteltavaRivi, tarkasteltavaSarake);
				
				if (tarkasteltava && tarkasteltava.firstChild &&
						tarkasteltava.firstChild.getPelaaja() !== this.getPelaaja()) {
					vihollisenNappulat.push(tarkasteltava.firstChild);
				}
			}
		}
		return vihollisenNappulat;
	};

    return nappula;
}


/**
 * Luo svg:tä käyttäen ympyrän halutun värisenä.
 * @param vari Ympyrän väriarvo.
 * @param sade Ympyrän säde.
 * @return svg-elementti, joka esittää ympyrää.
 */
function luoYmpyra(vari, sade) {
    var svgNS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewbox", "0 0 " + sade + " " + sade);
    svg.setAttribute("width", (sade * 2) + "px");
    svg.setAttribute("height", (sade * 2) + "px");
    svg.setAttribute("class", "ympyra");
    
    var ympyra = document.createElementNS(svgNS, "circle");
    ympyra.setAttribute("cx", sade);
    ympyra.setAttribute("cy", sade);
    ympyra.setAttribute("r", sade - 1);
    ympyra.setAttribute("style", "stroke:#006600; fill:" + vari);
    
    /**
	 * Vaihtaa ympyrän väriä annetun värin mukaiseksi.
	 * @param vari Väri, jolla ympyrä värjätään.
	 */
    ympyra.vaihdaVaria = function(vari) {
        this.setAttribute("style", "stroke:#006600; fill:" + vari);
    };
    
    /**
	 * Muuttaa ympyrän kokoa annetun säteen mukaiseksi.
	 * @param uusiSade Uusi säde, joka ympyrälle annetaan.
	 */
    ympyra.muutaKokoa = function(uusiSade) {
        this.setAttribute("cx", uusiSade);
        this.setAttribute("cy", uusiSade);
        this.setAttribute("r", uusiSade - 1);
    };
    
    svg.appendChild(ympyra);

	/**
	 * Vaihtaa ympyrän väriä annetun värin mukaiseksi.
	 * @param vari Väri, jolla ympyrä värjätään.
	 */
    svg.vaihdaVaria = function(vari) {
        svg.firstChild.vaihdaVaria(vari);
    };
    
	/**
	 * Muuttaa ympyrän kokoa annetun säteen mukaiseksi.
	 * @param uusiSade Uusi säde, joka ympyrälle annetaan.
	 */
    svg.muutaKokoa = function(uusiSade) {
        svg.setAttribute("width", (uusiSade * 2) + "px");
        svg.setAttribute("height", (uusiSade * 2) + "px");
        svg.setAttribute("viewbox", "0 0 " + uusiSade + " " + uusiSade);
        
        svg.firstChild.muutaKokoa(uusiSade);
    };
    
    return svg;
}


/**
 * Määrittää, mitä tehdään, kun pelinappulaa klikataan hiirellä.
 * @param event Tapahtuma, joka tämän funktioajon aiheutti.
 */
function pelinappulaaKlikattu(event) {
	event.stopPropagation();
	
    var nappula = event.target;
    if (!nappula || nappula.nodeName.toLowerCase() !== "svg")
        nappula = event.target.parentNode;
    if (!nappula || nappula.nodeName.toLowerCase() !== "svg")
        nappula = event.target.getElementsByTagName("svg")[0];
    if (!nappula || nappula.nodeName.toLowerCase() !== "svg") return;
    
	var vuoroOsoitin = document.getElementById("vuoro-osoitin");
	if (vuoroOsoitin.isVuoro(nappula.getPelaaja())) {
		if (valittuPelinappula) valittuPelinappula.poistaValinta();
		nappula.valitse();
		valittuPelinappula = nappula;
	}
}


/**
 * Luo virheilmoituselementin annetulla id:llä ja virhetekstillä.
 * @param id Virheilmoituselementin id.
 * @param teksti Virheilmoituselementin sisältämä virheteksti.
 * @return Luotu virheilmoituselementti.
 */
function luoVirheilmoitus(id, teksti) {
    var virheilmoitus = document.createElement("span");
    virheilmoitus.setAttribute("id", id);
    virheilmoitus.setAttribute("class", "virhe");
    virheilmoitus.appendChild(document.createTextNode(teksti));
    
    return virheilmoitus;
}


/**
 * Etsii annetusta radio-buttoneita sisältävästä taulukosta valitun vaihtoehdon
 * ja palauttaa sen indeksin tai -1, jos mikään ei ollut valittuna.
 * @param radiot Taulukko radio-buttoneista.
 * @return Valitun radio-buttonin indeksi annetussa taulukossa tai -1, jos mikään
 * ei ollut valittuna.
 */
function etsiValittu(radiot) {
    var valittu = -1;
    
    for (var i = 0; i < radiot.length; i++) {
        if (radiot[i].checked) {
            valittu = i;
            break;
        }
    }

    return valittu;
}


/**
 * Sovittaa pelilaudan näyttöön siten, että se käyttää mahdollisimman
 * hyvin tilan hyödykseen.
 */
function sovitaNayttoon() {
    var body = document.getElementById("ruudukko").parentNode;
    var vuoroOsoitin = document.getElementById("vuoro-osoitin");
	
    var leveys = window.innerWidth;
    var korkeus = window.innerHeight;
    
    console.log(leveys + "x" + korkeus);
    
    var yhtKorkeus = 0;
    
    var lapset = body.children;
    for (var i = 0; i < lapset.length; i++) {
		if (lapset[i] === vuoroOsoitin) continue;
		
        var tyyli = window.getComputedStyle(lapset[i]);
        if (!tyyli) continue;
        yhtKorkeus += parseFloat(tyyli.getPropertyValue("margin-top"));
        yhtKorkeus += parseFloat(tyyli.getPropertyValue("margin-bottom"));
        yhtKorkeus += parseFloat(tyyli.getPropertyValue("border-top-width"));
        yhtKorkeus += parseFloat(tyyli.getPropertyValue("border-bottom-width"));
        
        yhtKorkeus = Math.ceil(yhtKorkeus);

        var nimi = lapset[i].nodeName.toLowerCase();
        if (nimi === "table") continue;
        var lapsenKorkeus = lapset[i].clientHeight;
        if (!isNaN(lapsenKorkeus)) yhtKorkeus += lapsenKorkeus;
    }
    
    var tyyli = window.getComputedStyle(body);
    yhtKorkeus += parseFloat(tyyli.getPropertyValue("margin-top"));
    yhtKorkeus += parseFloat(tyyli.getPropertyValue("margin-bottom"));
    yhtKorkeus += parseFloat(tyyli.getPropertyValue("border-top-width"));
    yhtKorkeus += parseFloat(tyyli.getPropertyValue("border-bottom-width"));
    yhtKorkeus = Math.ceil(yhtKorkeus);
    
    laudanMaxLeveysPx = Math.min(korkeus - yhtKorkeus, leveys);
    
    console.log("yht korkeys = " + yhtKorkeus);
    
    console.log("max leveys: " + laudanMaxLeveysPx);
    
    var ruudunLeveys = Math.floor(laudanMaxLeveysPx / ruutujaPerRivi);
    if (ruudunLeveys < 0) ruudunLeveys = 50;
    
    var taulu = body.getElementsByTagName("table")[0];
    var nappulat = taulu.getElementsByTagName("svg");
    for (var i = 0; i < nappulat.length; i++) {
        nappulat[i].muutaKokoa(Math.round((ruudunLeveys - 2) / 2));
    }
    
    var stylesheet = document.styleSheets[0];
    stylesheet.cssRules[1].style.width = ruudunLeveys + "px";
    stylesheet.cssRules[1].style.height = ruudunLeveys + "px";
}


/**
 * Alustaa ja näyttää pelivuorojen vuoro-osoittimen.
 */
function naytaVuoro() {
    var vuoroOsoitin = document.getElementById("vuoro-osoitin");
    if (!vuoroOsoitin) {
        vuoroOsoitin = luoVuoroOsoitin();
    }
	vuoroOsoitin.alusta();
}


/**
 * Luo, asettaa paikoilleen ja palauttaa vuoro-osoittimen.
 * @return Uusi vuoro-osoitin.
 */
function luoVuoroOsoitin() {
	var varit = ["red", "blue"];
	
    var vuoroOsoitin = luoYmpyra(varit[0], 30);
    vuoroOsoitin.setAttribute("id", "vuoro-osoitin");
    vuoroOsoitin.vuoro = 0;
    
	/**
	 * Vaihtaa vuoroa tämänhetkiseltä pelaajalta toiselle.
	 */
	vuoroOsoitin.vaihdaVuoroa = function() {
        if (this.vuoro < 0 || this.vuoro >= varit.length) this.vuoro = 0;
        
        this.vuoro = 1 - this.vuoro; // Vaihtaa 0 -> 1, 1 -> 0
		this.vaihdaVaria(varit[this.vuoro]);
    };
	
	/**
	 * Palauttaa vuoron pelin aloittajalle.
	 */
	vuoroOsoitin.alusta = function() {
		this.vuoro = 0;
		this.vaihdaVaria(varit[this.vuoro]);
	};
	
	/**
	 * Palauttaa tiedon, onko annetun pelinappulan pelaajalla pelivuoro.
	 * @param pelaaja Tarkasteltavan pelaajan numero.
	 * @return true, jos pelinappulan omistavalla pelaajalla on pelivuoro.
	 */
	vuoroOsoitin.isVuoro = function(pelaaja) {
		return this.vuoro === pelaaja;
	};
    
    var div = document.createElement("div");
    div.appendChild(vuoroOsoitin);
    
    var body = document.getElementsByTagName("body")[0];
    body.appendChild(div);

    return vuoroOsoitin;
}
