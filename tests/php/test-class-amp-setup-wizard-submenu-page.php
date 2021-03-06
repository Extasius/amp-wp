<?php
/**
 * Tests for AMP_Setup_Wizard_Submenu_Page class.
 *
 * @package AMP
 */

/**
 * Tests for AMP_Setup_Wizard_Submenu_Page class.
 *
 * @group setup
 *
 * @since @todo NEW_ONBOARDING_RELEASE_VERSION
 *
 * @covers AMP_Setup_Wizard_Submenu
 */
class Test_AMP_Setup_Wizard_Submenu_Page extends WP_UnitTestCase {

	/**
	 * Test instance.
	 *
	 * @var AMP_Setup_Wizard_Submenu_Page
	 */
	private $page;

	/**
	 * Setup.
	 *
	 * @inheritdoc
	 */
	public function setUp() {
		parent::setUp();

		$this->page = new AMP_Setup_Wizard_Submenu_Page();
	}

	/**
	 * Tests AMP_Setup_Wizard_Submenu_Page::init
	 *
	 * @covers AMP_Setup_Wizard_Submenu_Page::init
	 */
	public function test_init() {
		$this->page->init();

		$this->assertEquals( 10, has_action( 'admin_enqueue_scripts', [ $this->page, 'enqueue_assets' ] ) );
	}

	/**
	 * Tests AMP_Setup_Wizard_Submenu_Page::render
	 *
	 * @covers AMP_Setup_Wizard_Submenu_Page::render
	 */
	public function test_render() {
		ob_start();

		$this->page->render();

		$this->assertEquals( trim( ob_get_clean() ), '<div id="amp-setup"></div>' );
	}

	/**
	 * Tests AMP_Setup_Wizard_Submenu_Page::screen_handle
	 *
	 * @covers AMP_Setup_Wizard_Submenu_Page::screen_handle
	 */
	public function test_screen_handle() {
		$this->assertEquals( $this->page->screen_handle(), 'amp_page_amp-setup' );
	}

	/**
	 * Tests AMP_Setup_Wizard_Submenu_Page::enqueue_assets
	 *
	 * @covers AMP_Setup_Wizard_Submenu_Page::enqueue_assets
	 */
	public function test_enqueue_assets() {
		$handle = 'amp-setup';

		$this->page->enqueue_assets( $this->page->screen_handle() );
		$this->assertTrue( wp_script_is( $handle ) );
	}
}
