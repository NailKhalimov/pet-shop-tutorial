App = {
  Provider: null,
  contracts: {},

  init: async function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        petsRow.append(petTemplate.html());
      }
    });

    return await App.initEtherJS();
  },

  initEtherJS: async function() {
    App.Provider = new ethers.providers.Web3Provider(window.ethereum)

    // The Metamask plugin also allows signing transactions to
    // send ether and pay to change state within the blockchain.
    // For this, you need the account signer...
    const signer = App.Provider.getSigner()

    return App.initContract();
  },

  initContract: function() {
    const ABI = [
      'function adopt(uint petId) returns (uint)',
      'function getAdopters() view returns (address[16])'
    ];
    const address = "0x071F00Fb9D1000Be54f8E29EBEbd656CaC9c08fe";
    
    App.contracts.Adoption = new ethers.Contract(address, ABI, App.Provider)
    
    App.markAdopted();

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },

  markAdopted: async function() {
    App.contracts.Adoption.getAdopters()
      .then(function(adopters) {
        for (i = 0; i < adopters.length; i++) {
          if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
            $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
          }
        }
      }).catch(function(err) {
        console.log(err)
        console.error(err.message);
      });
  },

  handleAdopt: function(event) {
    event.preventDefault();
    
    const petId = parseInt($(event.target).data('id'));

    App.contracts.Adoption.adopt(petId)
      .then(function(res) {
        console.log(res);
        return App.markAdopted();
      }).catch(function(err) {
        console.log(err.message);
      });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
