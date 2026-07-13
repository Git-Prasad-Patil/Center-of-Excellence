Feature: Shopping on Automation Exercise
  As a shopper on the Automation Exercise store
  I want to search for products, manage my shopping cart, and check out
  So that I can successfully buy the items I need

  Background:
    Given I am on the Automation Exercise home page

  # ---------------------------------------------------------------------
  # Search
  # ---------------------------------------------------------------------

  @search @happy-path
  Scenario: Searching for an existing product returns matching results
    When I search the store for "Blue Top"
    Then the search results should include a product named "Blue Top"

  @search @negative
  Scenario: Searching for a product that does not exist returns no results
    When I search the store for "zzznotarealproduct123"
    Then I should see zero products in the search results

  @search @edge-case
  Scenario Outline: Searching with unusual input does not break the store
    When I search the store for "<term>"
    Then the store should respond without an application error

    Examples:
      | term                                                                   |
      |                                                                         |
      | !@#$%^&*()                                                             |
      | aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa  |

  # ---------------------------------------------------------------------
  # Cart
  # ---------------------------------------------------------------------

  @cart @happy-path
  Scenario: Adding a single product to the cart shows a confirmation and the correct cart contents
    Given I have searched the store for "Blue Top"
    When I add "Blue Top" to the cart
    Then I should see a confirmation that the product was added to the cart
    And my cart should contain "Blue Top"

  @cart @happy-path
  Scenario: Adding several different products accumulates the correct number of items in the cart
    When I add the following products to the cart:
      | searchTerm | product      |
      | Blue Top   | Blue Top     |
      | Tshirt     | Men Tshirt   |
    Then my cart should contain 2 line items

  @cart @edge-case
  Scenario: Choosing a quantity greater than one before adding to the cart updates the line total accordingly
    When I add "Blue Top" to the cart with a quantity of 3
    Then the cart line for "Blue Top" should total 3 times its unit price

  @cart @edge-case
  Scenario: Removing the only item from the cart empties it
    Given I have added "Blue Top" to the cart
    When I remove "Blue Top" from the cart
    Then my shopping cart should be empty

  @cart @negative
  Scenario: Proceeding to checkout without logging in prompts the shopper to sign in
    Given I have added "Blue Top" to the cart
    When I try to proceed to checkout without logging in
    Then I should be prompted to register or login before checking out

  # ---------------------------------------------------------------------
  # Checkout
  # ---------------------------------------------------------------------

  @checkout @happy-path
  Scenario: A newly registered shopper completes checkout and payment successfully
    Given I have added "Blue Top" to the cart
    When I register a new account with the following details:
      | namePrefix | emailPrefix | password       | firstName | lastName | address1        | country       | state | city   | zipcode | mobile     |
      | QA Tester  | qa.autotest | Password123!   | QA        | Tester   | 123 Test Street | United States | Texas | Austin | 73301   | 5125551234 |
    And I proceed to checkout and place the order with the comment "Please deliver in the evening."
    And I pay with the following card details:
      | nameOnCard | cardNumber       | cvc | expiryMonth | expiryYear |
      | QA Tester  | 4111111111111111 | 123 | 05          | 2030       |
    Then I should see an order confirmation

  @account @negative
  Scenario: Logging in with incorrect credentials is rejected
    When I attempt to log in with email "nonexistent.user.zzz@example.com" and password "wrongpassword"
    Then I should see an error that my email or password is incorrect
