App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load pets.
    
    return await App.initWeb3();
  },


  initWeb3: async function() {
      // Modern dapp browsers...
      if (window.ethereum) {
        App.web3Provider = window.ethereum;
        try {
          // Request account access
          await window.ethereum.request({ method: "eth_requestAccounts" });;
        } catch (error) {
          // User denied account access...
          console.error("User denied account access")
        }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        App.web3Provider = window.web3.currentProvider;
      }
      // If no injected web3 instance is detected, fall back to Ganache
      else {
        App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      }
      web3 = new Web3(App.web3Provider);
  
      return App.initContract();
  },


  initContract: function() {
      $.getJSON('Election.json', function(data) {
          // Get the necessary contract artifact file and instantiate it with @truffle/contract
          var ElectionArtifact = data;
          App.contracts.Election = TruffleContract(ElectionArtifact);
      
          // Set the provider for our contract
          App.contracts.Election.setProvider(App.web3Provider);
          App.contracts.Election.defaults({
            from: web3.eth.coinbase
          });  
          return App.initCandidates();
          // console.log("HERE");
          // return App.getCandidates();
      });

      return App.bindEvents();
  },

  initCandidates: function() {
    $.getJSON('./candidates.json', function(data) {
      var candidatesRow = $('#candidatesRow');
      var candidatesTemplate = $('#candidatesTemplate');
      for (i = 0; i < data.length; i ++) {
        candidatesTemplate.find('.panel-title').text(data[i].name);
        candidatesTemplate.find('img').attr('src', data[i].picture);
        candidatesTemplate.find('.candidate-age').text(data[i].age);
        candidatesTemplate.find('.candidate-location').text(data[i].location);
        candidatesTemplate.find('.candidate-votes').text(data[i].votes);
        candidatesTemplate.find('.btn-vote').attr('data-id', data[i].id);

        candidatesTemplate.attr("try", data[i].votes);
        candidatesTemplate.attr("id", "candidate"+i);
        candidatesRow.append(candidatesTemplate.html());
        
        App.addCandidate(data[i].name);
      }
    });
  },

  
  addCandidate: function(name) {
    var electionInstance;

    App.contracts.Election.deployed().then(function(instance) {
        electionInstance = instance;
        // console.log("HERE1");
        // console.log(electionInstance.electionName());
        // console.log(electionInstance.currentCandidate());
        // console.log("HERE2");

    return electionInstance.addCandidate(name);
    }).then(function(){
      // console.log("HERE3");
      console.log("Candidate "+name+ " added!");
      // electionInstance.candidates(electionInstance.currentCandidate()-1)
      // .then(function(result){
        // console.log(result[0]);
        // console.log(result[1]);
      // });
      // console.log(currentCandidate);
    })
    .catch(function(err) {
        console.log(err);
    });
},


  getCandidates: function() {
      var electionInstance;

      App.contracts.Election.deployed().then(function(instance) {
          electionInstance = instance;
          return electionInstance.currentCandidate();

      // return electionInstance.candidates();

      }).then(function(candidatesSize) {
        for (i = 0; i < candidatesSize; i++) {
            electionInstance.candidates(i)
            .then(function(candidate){
              console.log(candidate[0]);
              // console.log(candidate[1]);
            })
        }


        // $('.panel-candidate').eq(0).find('.candidate-votes').text("1");
          // for (i = 0; i < candidates.length; i++) {
            // $('.panel-candidate').eq(i).find('.candidate-votes').text(1);
            // if (candidates[i] !== '0x0000000000000000000000000000000000000000') {
            //   $('.panel-candidate').eq(i).find('button').text('Voted!').attr('disabled', true);
            // }
          // }
          // console.log(candidates);
      }).catch(function(err) {
          console.log(err);
      });
  },

  bindEvents: function() {
    $(document).on('click', '.btn-vote', App.handleSelect);
  },

  handleSelect: function(event) {

      // var candidatesRow = $('#candidatesRow');
      event.preventDefault();
      // App.getCandidates();

      var candidateId = parseInt($(event.target).data('id'));

      // var candidateVotes = $(event.target).data();
    
      var electionInstance;

      web3.eth.getAccounts(function(error, accounts) {
          if (error) {
              console.log(error);
          }

          var account = accounts[0];

          App.contracts.Election.deployed().then(async function(instance) {
              electionInstance = instance;



              return await electionInstance.vote(candidateId, {from: account}).then(function(){
                // console.log("SABABA");
                console.log('candidate ID is: '+candidateId);
                $('.panel-candidate').eq(candidateId).find('button').text('Success').attr('disabled', true);

                electionInstance.candidates(candidateId).then(function(candidate){
                  console.log("This is curernt votes: "+parseInt(candidate[1]));
                  $('.panel-candidate').eq(candidateId).find('.candidate-votes').text(candidate[1]+'');

                })
                
              }).catch(function(err) {
                // console.log("BLAH BLAH BLAH");
                console.log(err);
              });
          })
          .catch(function(err) {
              console.log(err);
          });
      });
  }
};

$(function() {
  $(window).load(function() {
      App.init();
  });
});