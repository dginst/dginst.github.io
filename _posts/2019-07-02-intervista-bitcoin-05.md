---
layout: post
comments: false
title: "[ITA] Bitcoin: oro digitale, finanza e tulipani (puntata 5 di 11)"
subtitle: "Intervista a Ferdinando Ametrano"
author: "Staff"
image:
    thumb: 2019-07-02-intervista-bitcoin-05-thumb.jpg
youtube: owAwuxfDZe4
published: true
newsfeed: false
---

Quinta puntata dell'intervista al nostro direttore
[*Ferdinando Ametrano*](https://www.ametrano.net)
sul tema Bitcoin,
a cura di *Nicole Vismara* (manager di Deloitte Consulting).
Le successive puntate verranno pubblicate con cadenza regolare
ogni martedì e giovedì, in coda sono presenti i link alle puntate precedenti.
Di seguito la trascrizione di questa puntata.

### 5 - Come funzione Bitcoin

**[NV] È vero che le transazioni bitcoin sono anonime?**

[FA] Bitcoin esiste solo come bene scritturale, transazione registrata su un libro mastro digitale condiviso in modalità peer-to-peer tra i nodi di un network. Ogni nodo ha una copia di questo registro contabile pubblico, chiamato blockchain, sul quale sono annotati tutti i cambi di proprietà di bitcoin, in maniera totalmente trasparente per chiunque. Non c’è quindi reale anonimato, ma siccome le controparti di ogni transazione non sono attori identificati si parla spesso di pseudonimato.

**[NV] Se non è nominativamente associato, qual è il titolo di possesso di bitcoin?**

[FA] I bitcoin appartengono a chi è tecnicamente capace di spenderli, cioè di trasferirli ad altri. Per trasferirli si usa la crittografia asimmetrica basata su chiave privata e chiave pubblica, tipica della firma digitale: chi conosce una chiave privata può firmare con quella una disposizione di trasferimento e la firma è verificabile da tutti i nodi della rete utilizzando la corrispondente chiave pubblica. Siccome i bitcoin sono associati ad indirizzi che derivano univocamente dalle chiavi pubbliche, la chiave pubblica permette anche di constatare se i bitcoin che si vogliono trasferire siano effettivamente nella disponibilità dell’indirizzo corrispondente e quindi ultimamente del detentore della corrispondente chiave privata usata per firmare la transazione. Se la transazione è quindi complessivamente valida, viene registrata sulla blockchain mettendo i bitcoin trasferiti a disposizione di un nuovo indirizzo. Questo nuovo indirizzo deriva anch’esso da una chiave pubblica, la cui corrispondente chiave privata è a quel punto la sola che potrà spenderli ulteriormente. Insomma il possesso della chiave privata è il possesso dei bitcoin associati, perché consente di spenderli.

**[NV] Chi certifica la spesa, chi aggiorna la blockchain?**

[FA] Ogni transazione è validata da tutti i nodi della rete, ma la sua finalizzazione avviene quando entra nel registro transazionale chiamato blockchain, cioè catena di blocchi: le transazioni sono infatti accorpate in blocchi concatenati sequenzialmente. I blocchi possono essere creati da qualsiasi nodo (in questo caso chiamato nodo di mining, o miner), a patto che fornisca la proof-of-work prevista dal protocollo, cioè la prova di aver effettuato il lavoro computazionale necessario. È l’accumularsi di questo lavoro che rende sicura la blockchain: un agente malevolo che volesse manipolarla dovrebbe essere in grado di fare più lavoro dell’insieme di tutti i miner onesti.

**[NV] Cosa motiva i nodi a svolgere questo lavoro computazionale?**

[FA] Un incentivo economico: il nodo che crea un blocco è ricompensato con l’emissione di nuovi bitcoin, attraverso una transazione speciale (coinbase) inclusa nello stesso blocco. Il protocollo bitcoin è come se in qualche modo socializzasse la rendita di signoraggio (la gigantesca ricchezza che origina dalla creazione di moneta) per coprire i costi della rete, o meglio del consenso distribuito. Questa remunerazione è cruciale per incentivare il comportamento onesto dei miner: se un blocco contenesse transazioni invalide (o transazioni “valide” ma che tentano però di spendere due volte gli stessi bitcoin) verrebbe rigettato dagli altri nodi come invalido, con l’effetto di annullare anche la ricompensa del miner contenuta nel blocco. Si è innescato quindi un circolo virtuoso: i miner competono per la ricompensa di signoraggio ed investono in potenza computazionale; maggiore potenza computazionale rende il network più sicuro; maggiore sicurezza fa crescere il valore di bitcoin; la remunerazione di signoraggio diventa quindi ancora più appetibile per i miner.

**[NV] Sembra un po' complicato...**

[FA] Bitcoin combina in maniera inedita e creativa elementi di crittografia, teoria monetaria ed economica, sistemi distribuiti, teoria dei giochi. È complicato comprenderne la natura sinfonica che amalgama elementi così diversi: per questo spesso se ne colgono (e criticano) aspetti parziali, perdendo di vista l’insieme. Però bitcoin si può usare in modo semplice, così come per telefonare non è necessario capire come funzioni la rete GSM.


[Playlist YouTube con tutti gli interventi](https://www.youtube.com/playlist?list=PLTLa2tRY91LKw5CrWIFFeIws08Sr7q-jC)

[1: Oro digitale](https://dgi.io/2019/06/17/intervista-bitcoin-01.html)

[2: Tra truffa e speculazione](https://dgi.io/2019/06/20/intervista-bitcoin-02.html)

[3: Regolazione](https://dgi.io/2019/06/25/intervista-bitcoin-03.html)

[4: La finanza](https://dgi.io/2019/06/27/intervista-bitcoin-04.html)

[6: Ico, forkcoin e altcoin](https://dgi.io/2019/07/04/intervista-bitcoin-06.html)
